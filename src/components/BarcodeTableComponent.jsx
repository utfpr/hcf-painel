import axios from "axios";
import React, { Component } from "react";
import { Table, Button, message, Modal, Input, Image, Tooltip } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { uploadsUrl } from "../config/api";
import UploadPicturesComponent from "@/components/UploadPicturesComponent";

export const BarcodeColumns = [
    {
        title: "Código de Barras",
        type: "number",
        key: "codigo_barra",
        width: 520,
    },
    { title: "Imagem anexada", key: "preview", width: 220 },
    {
        title: "Anexar Imagem ao código",
        type: "text",
        key: "anexar",
        width: 180,
    },
    { title: "Ação", key: "acao", width: 120 },
];

export default class BarcodeTableComponent extends Component {
    baselineFetchedOnce = false;

    state = {
        barcodeRows: [],
        lastBaseNumber: null,
        isGenerating: false,
        isLoaded: true,

        photosByCode: {},

        isGenerationModalOpen: false,
        previousFormattedCode: "—",
        newCodeInput: "",
    };

    constructor(props) {
        super(props);
        this.columns = this.buildColumns(BarcodeColumns);
    }

    componentDidMount() {
        this.syncFromProps(this.props.barcodeEditList);
        if (this.props.barcodePhotos) {
            this.initializePhotosFromServer(this.props.barcodePhotos);
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.barcodeEditList !== this.props.barcodeEditList) {
            this.syncFromProps(this.props.barcodeEditList);
        }
        if (
            prevProps.barcodePhotos !== this.props.barcodePhotos &&
            this.props.barcodePhotos
        ) {
            this.initializePhotosFromServer(this.props.barcodePhotos);
        }
    }

    emitChangePhotos = () => {
        if (typeof this.props.onChangeBarcodePhotos === "function") {
            this.props.onChangeBarcodePhotos(this.state.photosByCode);
        }
    };

    emitInitPhotos = (initialMap) => {
        if (typeof this.props.onInitBarcodePhotos === "function") {
            this.props.onInitBarcodePhotos(initialMap);
        }
    };

    absoluteUploadUrl = (pathOrFile) => {
        const base = String(uploadsUrl || "").replace(/\/+$/, "");
        const rel = String(pathOrFile || "").replace(/^\/+/, "");
        return `${base}/${rel}`;
    };

    buildCandidatePhotoUrls = (numBarra) => {
        const base = this.absoluteUploadUrl(encodeURIComponent(numBarra));
        const cacheBuster = `?t=${Date.now()}&r=${Math.random()}&cb=${performance.now()}`;
        return [`${base}${cacheBuster}`];
    };

    probeImageExists = async (url) => {
        try {
            const get = await fetch(url, {
                method: "GET",
                cache: "no-cache",
                headers: {
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    Pragma: "no-cache",
                    Expires: "0",
                },
            });
            return get.ok;
        } catch {
            return false;
        }
    };

    populatePhotosFromUploads = async (rows) => {
        if (!Array.isArray(rows) || !rows.length) return;

        const updates = {};
        const touchedCodes = [];

        for (const r of rows) {
            const num = this.parseNumber(r?.num_barra);
            const code = r?.codigo_barra;
            if (!Number.isFinite(num) || !code) continue;

            const candidates = this.buildCandidatePhotoUrls(num);
            let foundUrl = null;
            for (const url of candidates) {
                const exists = await this.probeImageExists(url);
                if (exists) {
                    foundUrl = url;
                    break;
                }
            }
            if (foundUrl) {
                updates[code] = [
                    {
                        uid: `server-${code}`,
                        url: foundUrl,
                        name: `${num}`,
                        status: "done",
                    },
                ];
                touchedCodes.push(code);
            }
        }

        if (Object.keys(updates).length) {
            this.setState(
                (prev) => ({
                    photosByCode: { ...prev.photosByCode, ...updates },
                }),
                () => {
                    this.bumpPreviewTicks(touchedCodes);
                    this.emitChangePhotos();
                }
            );
        }
    };

    initializePhotosFromServer = async (photosOrRows) => {
        if (!Array.isArray(photosOrRows) || !photosOrRows.length) return;

        const map = {};
        const touchedCodes = [];
        const toProbe = [];

        for (const item of photosOrRows) {
            const code = item?.codigo_barra;
            const num = this.parseNumber(item?.num_barra);
            const caminho = item?.caminho_foto;
            if (!code || !Number.isFinite(num)) continue;

            if (caminho) {
                const baseUrl = this.absoluteUploadUrl(caminho);
                const cacheBuster = `?t=${Date.now()}&r=${Math.random()}&init=1`;
                const url = `${baseUrl}${cacheBuster}`;
                map[code] = [
                    {
                        uid: `server-${code}-${Date.now()}`,
                        url,
                        name: caminho,
                        status: "done",
                    },
                ];
                touchedCodes.push(code);
            } else {
                toProbe.push({ codigo_barra: code, num_barra: num });
            }
        }

        if (Object.keys(map).length) {
            this.setState(
                (prev) => ({ photosByCode: { ...prev.photosByCode, ...map } }),
                () => {
                    this.bumpPreviewTicks(touchedCodes);
                    this.emitInitPhotos({ ...map });
                    this.emitChangePhotos();
                }
            );
        }

        if (toProbe.length) {
            await this.populatePhotosFromUploads(toProbe);
        }
    };

    syncFromProps = (list) => {
        if (!Array.isArray(list) || !list.length) return;
        const normalized = this.normalizeIncomingList(list);
        const max = this.getMaxNumBarra(normalized);

        this.setState(
            {
                barcodeRows: normalized,
                lastBaseNumber: Number.isFinite(max)
                    ? max
                    : this.state.lastBaseNumber,
            },
            () => {
                this.emitChangeData();
                this.populatePhotosFromUploads(normalized);
            }
        );
    };

    normalizeIncomingList = (list) =>
        list
            .map((item) => {
                if (typeof item === "string") {
                    const parsed = this.parseNumber(item);
                    const formatted =
                        item && item.startsWith("HCF")
                            ? item
                            : this.formatCodeLabel(parsed || 0);
                    return {
                        key: formatted,
                        codigo_barra: formatted,
                        num_barra: Number.isFinite(parsed)
                            ? parsed
                            : this.parseNumber(formatted),
                        em_vivo: true,
                        previewTick: 0,
                    };
                }
                if (item && typeof item === "object") {
                    const rawCode =
                        item.codigo_barra ||
                        item.codigo ||
                        item.code ||
                        item.label ||
                        "";
                    const rawNum = Number.isFinite(item.num_barra)
                        ? Math.trunc(item.num_barra)
                        : this.parseNumber(rawCode);
                    const formatted =
                        rawCode && rawCode.startsWith("HCF")
                            ? rawCode
                            : this.formatCodeLabel(rawNum || 0);
                    return {
                        key: formatted,
                        codigo_barra: formatted,
                        num_barra: Number.isFinite(rawNum)
                            ? rawNum
                            : this.parseNumber(formatted),
                        em_vivo: item.em_vivo ?? true,
                        id: item.id,
                        previewTick: 0,
                    };
                }
                return null;
            })
            .filter(Boolean);

    emitChangeData = () => {
        const payload = this.state.barcodeRows.map(
            ({ codigo_barra, num_barra, id }) => ({
                codigo_barra,
                num_barra,
                id,
            })
        );
        if (typeof this.props.onChangeBarcodeList === "function") {
            this.props.onChangeBarcodeList(payload);
        }
        if (typeof this.props.onChangeBarcodeLista === "function") {
            this.props.onChangeBarcodeLista(payload);
        }
    };

    fetchLastBarcodeService = async () => {
        const { data } = await axios.get("/tombos/ultimo_codigo_barra", {
            params: { _cb: Date.now() },
            headers: { "Cache-Control": "no-cache" },
        });
        if (data == null || data === "") {
            throw new Error(
                "Resposta vazia ao requisitar último código de barras."
            );
        }
        return data;
    };

    formatCodeLabel = (n) => `HCF${String(n).padStart(9, "0")}`;

    extractBaseNumberFromPayload = (payload) => {
        const raw = payload?.num_barra ?? payload?.numBarra;
        if (raw != null) {
            const inteiro = parseInt(String(raw).split(".")[0], 10);
            if (Number.isFinite(inteiro)) return inteiro;
        }
        const cb = payload?.codigo_barra;
        if (typeof cb === "string") {
            const digits = cb.replace(/\D/g, "");
            if (digits) {
                const inteiro = parseInt(digits, 10);
                if (Number.isFinite(inteiro)) return inteiro;
            }
        }
        return null;
    };

    parseNumber = (val) => {
        if (val == null) return NaN;
        if (typeof val === "number") return Math.trunc(val);
        const digits = String(val).replace(/\D/g, "");
        return digits ? parseInt(digits, 10) : NaN;
    };

    getMaxNumBarra = (rows) => {
        const nums = rows
            .map((r) => this.parseNumber(r?.num_barra))
            .filter(Number.isFinite);
        return nums.length ? Math.max(...nums) : NaN;
    };

    appendRowWithNumber = (nextNumber) => {
        const formatted = this.formatCodeLabel(nextNumber);
        const newRow = {
            key: formatted,
            codigo_barra: formatted,
            em_vivo: true,
            num_barra: nextNumber,
            previewTick: 0,
        };
        this.setState(
            (prev) => ({ barcodeRows: [...prev.barcodeRows, newRow] }),
            () => {
                message.success(`Código gerado: ${formatted}`);
                this.emitChangeData();
            }
        );
    };

    bumpPreviewTick = (codigoBarra) => {
        this.setState((prev) => ({
            barcodeRows: prev.barcodeRows.map((r) =>
                r?.codigo_barra === codigoBarra
                    ? { ...r, previewTick: Date.now() }
                    : r
            ),
        }));
    };

    bumpPreviewTicks = (codigoList) => {
        if (!Array.isArray(codigoList) || !codigoList.length) return;
        const setCodes = new Set(codigoList);
        const stamp = Date.now();
        this.setState((prev) => ({
            barcodeRows: prev.barcodeRows.map((r) =>
                r && setCodes.has(r.codigo_barra)
                    ? { ...r, previewTick: stamp }
                    : r
            ),
        }));
    };

    getPhotosOfCode = (codigo) => this.state.photosByCode[codigo] ?? [];

    setPhotosOfCode = (codigo, list) => {
        this.setState(
            (prev) => ({
                photosByCode: { ...prev.photosByCode, [codigo]: list },
            }),
            () => {
                this.bumpPreviewTick(codigo);
                this.emitChangePhotos();
            }
        );
    };

    handleBeforeUploadPhoto = (record) => (file) => {
        const code = record?.codigo_barra;
        this.setPhotosOfCode(code, [file]);
        return false;
    };

    refreshPhotosAfterUpload = async (codigoBarra) => {
        const num = this.parseNumber(codigoBarra);
        if (!Number.isFinite(num)) return;

        await new Promise((resolve) => setTimeout(resolve, 1000));

        const baseUrl = this.absoluteUploadUrl(encodeURIComponent(num));
        const cacheBuster = `?t=${Date.now()}&r=${Math.random()}&force=1`;
        const url = `${baseUrl}${cacheBuster}`;

        try {
            const response = await fetch(url, {
                method: "GET",
                cache: "no-cache",
                headers: {
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    Pragma: "no-cache",
                    Expires: "0",
                },
            });

            if (response.ok) {
                this.setState(
                    (prev) => {
                        const newPhotosByCode = { ...prev.photosByCode };
                        newPhotosByCode[codigoBarra] = [
                            {
                                uid: `server-${codigoBarra}-${Date.now()}`,
                                url,
                                name: `${num}`,
                                status: "done",
                            },
                        ];
                        return { photosByCode: newPhotosByCode };
                    },
                    () => {
                        this.bumpPreviewTick(codigoBarra);
                        this.emitChangePhotos();
                    }
                );
            }
        } catch (error) {
            console.error("Erro ao recarregar imagem:", error);
        }
    };

    handleRemovePhoto = (record) => (file) => {
        const code = record?.codigo_barra;
        const current = this.getPhotosOfCode(code);
        const index = current.indexOf(file);
        const nextList = current.filter((_, i) => i !== index);
        this.setPhotosOfCode(code, nextList);
    };

    emitDeleted = (row) => {
        if (typeof this.props.onDeletedBarcode === "function") {
            this.props.onDeletedBarcode(row);
        }
    };

    handleDeleteRow = (record, index) => {
        Modal.confirm({
            title: "Excluir código",
            content: (
                <div>
                    Tem certeza que deseja excluir permanentemente o código:{" "}
                    <b>{record?.codigo_barra}</b>?
                    <br />
                    <span style={{ color: "#cf1322" }}>
                        O código será permanentemente perdido!
                    </span>
                </div>
            ),
            okText: "Sim, quero excluir",
            okType: "danger",
            cancelText: "Cancelar",
            onOk: () => {
                const formatted = record?.codigo_barra;

                this.setState(
                    (prev) => {
                        const rowsCopy = [...prev.barcodeRows];
                        rowsCopy.splice(index, 1);
                        const photosCopy = { ...prev.photosByCode };
                        delete photosCopy[formatted];
                        return {
                            barcodeRows: rowsCopy,
                            photosByCode: photosCopy,
                        };
                    },
                    () => {
                        message.success(`Código removido: ${formatted}`);
                        this.emitChangeData();
                        this.emitChangePhotos();
                        this.emitDeleted({
                            codigo_barra: record?.codigo_barra,
                            num_barra: record?.num_barra,
                            id: record?.id,
                        });
                    }
                );
            },
        });
    };

    handleOpenGenerationModal = async () => {
        this.setState({
            isGenerationModalOpen: true,
            isGenerating: true,
            previousFormattedCode: "—",
            newCodeInput: "",
        });

        try {
            const { lastBaseNumber, barcodeRows } = this.state;
            let previousNumber;

            if (!this.baselineFetchedOnce) {
                const resp = await this.fetchLastBarcodeService();
                const payload = resp?.data ?? resp?.body ?? resp;
                const base = this.extractBaseNumberFromPayload(payload);
                if (!Number.isFinite(base)) {
                    message.warning(
                        "O Último Tombo registrado não possui código registrado. Sugerindo sequência a partir de: 41800"
                    );
                    previousNumber = 41800;
                } else {
                    previousNumber = base;
                    this.setState({ lastBaseNumber: base });
                }
                this.baselineFetchedOnce = true;
            } else {
                if (this.state.barcodeRows.length > 0) {
                    const max = this.getMaxNumBarra(this.state.barcodeRows);
                    previousNumber = Number.isFinite(max) ? max : null;
                } else if (Number.isFinite(lastBaseNumber)) {
                    previousNumber = lastBaseNumber;
                } else {
                    const resp = await this.fetchLastBarcodeService();
                    const payload = resp?.data ?? resp?.body ?? resp;
                    const base = this.extractBaseNumberFromPayload(payload);
                    if (!Number.isFinite(base)) {
                        message.warning(
                            "O Último Tombo registrado não possui código registrado. Sugerindo sequência a partir de: 41800"
                        );
                        previousNumber = 41800;
                    } else {
                        previousNumber = base;
                        this.setState({ lastBaseNumber: base });
                    }
                }
            }

            const nextNumber =
                (Number.isFinite(previousNumber) ? previousNumber : 0) + 1;

            this.setState({
                previousFormattedCode: Number.isFinite(previousNumber)
                    ? this.formatCodeLabel(previousNumber)
                    : "—",
                newCodeInput: this.formatCodeLabel(nextNumber),
            });
        } catch (e) {
            console.error("Erro ao preparar geração:", e);
            message.error("Erro ao preparar geração do código.");
        } finally {
            this.setState({ isGenerating: false });
        }
    };

    handleCloseGenerationModal = () => {
        this.setState({
            isGenerationModalOpen: false,
            previousFormattedCode: "—",
            newCodeInput: "",
        });
    };

    handleConfirmGeneration = () => {
        const { newCodeInput } = this.state;
        const newNumber = this.parseNumber(newCodeInput);
        if (!Number.isFinite(newNumber) || newNumber <= 0) {
            message.warning(
                "Informe um novo código válido (número ou HCF completo)."
            );
            return;
        }
        this.appendRowWithNumber(newNumber);
        this.setState({
            isGenerationModalOpen: false,
            previousFormattedCode: "—",
            newCodeInput: "",
        });
    };

    buildColumns = (columns) =>
        columns.map((col) => {
            if (col.key === "preview") {
                return {
                    ...col,
                    dataIndex: col.key,
                    key: col.key,
                    shouldCellUpdate: (record, prevRecord) =>
                        record?.previewTick !== prevRecord?.previewTick ||
                        record?.codigo_barra !== prevRecord?.codigo_barra,
                    render: (_, record) => {
                        const list = this.getPhotosOfCode(record?.codigo_barra);
                        if (!list.length) {
                            return <span style={{ color: "#999" }}>-</span>;
                        }
                        const file = list[0];
                        const url = this.getPreviewUrl(file);
                        return (
                            <div
                                style={{ marginBottom: 8, textAlign: "center" }}
                            >
                                <Image
                                    width={120}
                                    src={url}
                                    alt={file?.name || record?.codigo_barra}
                                    style={{ objectFit: "cover" }}
                                />
                            </div>
                        );
                    },
                };
            }
            if (col.key === "anexar") {
                return {
                    ...col,
                    dataIndex: col.key,
                    key: col.key,
                    render: (_, record) => (
                        <UploadPicturesComponent
                            fileList={this.getPhotosOfCode(
                                record?.codigo_barra
                            )}
                            beforeUpload={this.handleBeforeUploadPhoto(record)}
                            onRemove={this.handleRemovePhoto(record)}
                        />
                    ),
                };
            }
            if (col.key === "acao") {
                return {
                    ...col,
                    dataIndex: col.key,
                    key: col.key,
                    render: (_, record, index) => (
                        <div style={{ display: "flex" }}>
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    this.handleDeleteRow(record, index);
                                }}
                            >
                                <DeleteOutlined style={{ color: "#e30613" }} />
                            </a>
                        </div>
                    ),
                };
            }
            return { ...col, dataIndex: col.key, key: col.key };
        });

    getPreviewUrl = (file) => {
        if (file?.url) {
            const baseUrl = file.url.split("?")[0];
            const cacheBuster = `?t=${Date.now()}&r=${Math.random()}&v=${
                file.uid || "default"
            }`;
            return `${baseUrl}${cacheBuster}`;
        }
        if (file?.thumbUrl) return file.thumbUrl;

        if (typeof window !== "undefined" && window.URL?.createObjectURL) {
            const f = file?.originFileObj || file;
            if (f && typeof File !== "undefined" && f instanceof File) {
                try {
                    return window.URL.createObjectURL(f);
                } catch {
                    /* noop */
                }
            }
        }
        return "";
    };

    render() {
        const {
            isLoaded,
            isGenerating,
            barcodeRows,
            isGenerationModalOpen,
            previousFormattedCode,
            newCodeInput,
        } = this.state;

        return (
            <>
                <div style={{ width: "100%" }}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "center",
                            width: "100%",
                            gap: 12,
                            paddingTop: 4,
                        }}
                    >
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            loading={isGenerating}
                            onClick={this.handleOpenGenerationModal}
                        >
                            Gerar código
                        </Button>
                    </div>

                    <div style={{ height: 24 }} />

                    {isLoaded && (
                        <Table
                            rowKey={(row) => row?.codigo_barra || row?.key}
                            columns={this.columns}
                            dataSource={barcodeRows}
                            pagination={false}
                            style={{ width: "100%" }}
                            scroll={{ x: "max-content" }}
                            size="middle"
                        />
                    )}
                </div>

                <Modal
                    open={isGenerationModalOpen}
                    title="Gerar novo código de barras"
                    onCancel={this.handleCloseGenerationModal}
                    onOk={this.handleConfirmGeneration}
                    okText="Gerar"
                    cancelText="Cancelar"
                    confirmLoading={isGenerating}
                    destroyOnClose
                >
                    <div style={{ marginBottom: 8 }}>
                        <div style={{ color: "#888" }}>Código anterior:</div>
                        <div style={{ fontWeight: 600 }}>
                            {previousFormattedCode}
                        </div>
                    </div>
                    <div>
                        <div style={{ color: "#888" }}>
                            Novo código (pode digitar o número ou o HCF
                            completo):
                        </div>
                        <Input
                            placeholder="Ex.: 41807 ou HCF000041807"
                            value={newCodeInput}
                            onChange={(e) =>
                                this.setState({ newCodeInput: e.target.value })
                            }
                            onPressEnter={this.handleConfirmGeneration}
                        />
                    </div>
                </Modal>
            </>
        );
    }
}
