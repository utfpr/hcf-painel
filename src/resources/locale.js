import ptBR from 'antd/lib/locale-provider/pt_BR';

const AntDesignLocale = {
    ...ptBR,
    Pagination: {
        ...ptBR.Pagination,
        items_per_page: 'por página',
    },
    Table: {
        ...ptBR.Table,
        filterReset: 'Limpar',
        sortTitle: 'Clique para ordernar',
    },
};

export default AntDesignLocale;
