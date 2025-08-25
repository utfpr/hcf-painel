import axios from "axios";
import React, { Component } from "react";
import { Table, Button, message, Modal, Input, Image, Tooltip } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import UploadPicturesComponent from "@/components/UploadPicturesComponent";

// Colunas (mantidas)
export const BarcodeColumns = [
  {
    title: "Código de Barras",
    type: "number",
    key: "codigo_barra",
    width: 600,
  },
  { title: "Anexar Imagem ao código", type: "text", key: "anexar", width: 180 },
  { title: "Ação", key: "acao", width: 120 },
];

export default class BarcodeTableComponent extends Component {
  state = {
    barcodeRows: [],
    lastBaseNumber: null,
    isGenerating: false,
    isLoaded: true,

    photosByCode: {},
    expandedCodes: [],

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
  }

  componentDidUpdate(prevProps) {
    if (prevProps.barcodeEditList !== this.props.barcodeEditList) {
      this.syncFromProps(this.props.barcodeEditList);
    }
  }

  // ===== Sincronização com props =====
  syncFromProps = (list) => {
    if (!Array.isArray(list) || !list.length) return;
    const normalized = this.normalizeIncomingList(list);
    const max = this.getMaxNumBarra(normalized);

    this.setState(
      {
        barcodeRows: normalized,
        lastBaseNumber: Number.isFinite(max) ? max : this.state.lastBaseNumber,
      },
      this.emitChangeData
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
          };
        }
        if (item && typeof item === "object") {
          const rawCode =
            item.codigo_barra || item.codigo || item.code || item.label || "";
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

  // ===== Serviços =====
  fetchLastBarcodeService = async () => {
    try {
      const res = await axios.get("/tombos/ultimo_codigo_barra", {
        validateStatus: (s) => (s >= 200 && s < 300) || s === 304,
      });
      let payload = res?.data ?? res;
      if (!payload || (typeof payload === "string" && !payload.trim())) {
        const res2 = await axios.get("/tombos/ultimo_codigo_barra", {
          params: { _cb: Date.now() },
          headers: { "Cache-Control": "no-cache" },
          validateStatus: (s) => (s >= 200 && s < 300) || s === 304,
        });
        payload = res2?.data ?? res2;
      }
      return payload;
    } catch (err) {
      const payload = err?.response?.data;
      if (payload) return payload;
      throw err;
    }
  };

  // ===== Helpers =====
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
    };
    this.setState(
      (prev) => ({ barcodeRows: [...prev.barcodeRows, newRow] }),
      () => {
        message.success(`Código gerado: ${formatted}`);
        this.emitChangeData();
      }
    );
  };

  // ===== Geração de códigos (modal) =====
  handleOpenGenerationModal = async () => {
    const { lastBaseNumber, barcodeRows } = this.state;
    this.setState({ isGenerating: true });

    try {
      let previousNumber;

      if (barcodeRows.length > 0) {
        const max = this.getMaxNumBarra(barcodeRows);
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

      const nextNumber =
        (Number.isFinite(previousNumber) ? previousNumber : 0) + 1;

      this.setState({
        isGenerationModalOpen: true,
        previousFormattedCode: Number.isFinite(previousNumber)
          ? this.formatCodeLabel(previousNumber)
          : "—",
        newCodeInput: this.formatCodeLabel(nextNumber), // pré-preenche com HCF completo
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

  // ===== Upload (máx. 1 imagem por código) =====
  getPhotosOfCode = (codigo) => this.state.photosByCode[codigo] ?? [];

  setPhotosOfCode = (codigo, list) => {
    this.setState((prev) => ({
      photosByCode: { ...prev.photosByCode, [codigo]: list },
    }));
  };

  handleBeforeUploadPhoto = (record) => (file) => {
    const code = record?.codigo_barra;
    this.setPhotosOfCode(code, [file]); // Máx. 1: substitui
    this.setState((prev) => ({
      expandedCodes: Array.from(new Set([...prev.expandedCodes, code])),
    }));
    return false; // impede upload automático
  };

  handleRemovePhoto = (record) => (file) => {
    const code = record?.codigo_barra;
    const current = this.getPhotosOfCode(code);
    const index = current.indexOf(file);
    const nextList = current.filter((_, i) => i !== index);
    this.setPhotosOfCode(code, nextList);
  };

  // ===== Exclusão de código =====
  deleteBarcodeOnServer = async (numeroCodigo) => {
    return axios.delete(
      `/tombos/codigo_barras/${encodeURIComponent(numeroCodigo)}`
    );
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
        const number = record?.num_barra;

        // snapshots para rollback
        const prevRows = [...this.state.barcodeRows];
        const prevPhotos = { ...this.state.photosByCode };
        const prevExpanded = [...this.state.expandedCodes];

        this.setState(
          (prev) => {
            const rowsCopy = [...prev.barcodeRows];
            rowsCopy.splice(index, 1);

            const photosCopy = { ...prev.photosByCode };
            delete photosCopy[formatted];

            return {
              barcodeRows: rowsCopy,
              photosByCode: photosCopy,
              expandedCodes: prev.expandedCodes.filter((k) => k !== formatted),
            };
          },
          async () => {
            try {
              await this.deleteBarcodeOnServer(number);
              message.success(`Código removido: ${formatted}`);
              this.emitChangeData();
            } catch (err) {
              console.error("Erro ao excluir no servidor:", err);
              message.error(
                "Falha ao excluir no servidor. Desfazendo alteração…"
              );
              this.setState(
                {
                  barcodeRows: prevRows,
                  photosByCode: prevPhotos,
                  expandedCodes: prevExpanded,
                },
                () => this.emitChangeData()
              );
            }
          }
        );
      },
    });
  };

  // ===== Colunas =====
  buildColumns = (columns) =>
    columns.map((col) => {
      if (col.key === "anexar") {
        return {
          ...col,
          dataIndex: col.key,
          key: col.key,
          render: (_, record) => (
            <UploadPicturesComponent
              fileList={this.getPhotosOfCode(record?.codigo_barra)}
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

  // ===== Linha expandida (fotos) =====
  renderExpandedRow = (record) => {
    const list = this.getPhotosOfCode(record?.codigo_barra);
    if (!list.length)
      return (
        <span style={{ color: "#999" }}>
          Nenhuma imagem anexada para este código.
        </span>
      );

    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 12,
        }}
      >
        {list.map((file, idx) => {
          const url =
            typeof window !== "undefined" && window.URL?.createObjectURL
              ? window.URL.createObjectURL(file)
              : "";
          return (
            <div
              key={`${record?.codigo_barra}-${idx}`}
              style={{
                border: "1px solid #f0f0f0",
                borderRadius: 8,
                padding: 8,
              }}
            >
              <div style={{ marginBottom: 8, textAlign: "center" }}>
                <Image
                  width={120}
                  src={url}
                  alt={file?.name}
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div
                style={{ fontSize: 12, color: "#555", marginBottom: 8 }}
                title={file?.name}
              >
                {file?.name}
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Tooltip title="Excluir">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      this.handleRemovePhoto(record)(file);
                    }}
                  >
                    <DeleteOutlined style={{ color: "#e30613" }} />
                  </a>
                </Tooltip>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ===== Render =====
  render() {
    const {
      isLoaded,
      isGenerating,
      barcodeRows,
      expandedCodes,
      isGenerationModalOpen,
      previousFormattedCode,
      newCodeInput,
    } = this.state;

    return (
      <>
        <div style={{ width: "100%" }}>
          {/* Header: botão de gerar */}
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
              expandable={{
                expandedRowRender: this.renderExpandedRow,
                expandedRowKeys: expandedCodes,
                onExpandedRowsChange: (keys) =>
                  this.setState({ expandedCodes: keys }),
              }}
            />
          )}
        </div>

        {/* Modal de Geração (com edição do novo código) */}
        <Modal
          open={isGenerationModalOpen}
          title="Gerar novo código de barras"
          onCancel={this.handleCloseGenerationModal}
          onOk={this.handleConfirmGeneration}
          okText="Gerar"
          cancelText="Cancelar"
          destroyOnClose
        >
          <div style={{ marginBottom: 8 }}>
            <div style={{ color: "#888" }}>Código anterior:</div>
            <div style={{ fontWeight: 600 }}>{previousFormattedCode}</div>
          </div>
          <div>
            <div style={{ color: "#888" }}>
              Novo código (pode digitar o número ou o HCF completo):
            </div>
            <Input
              placeholder="Ex.: 41807 ou HCF000041807"
              value={newCodeInput}
              onChange={(e) => this.setState({ newCodeInput: e.target.value })}
              onPressEnter={this.handleConfirmGeneration}
            />
          </div>
        </Modal>
      </>
    );
  }
}
