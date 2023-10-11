export default valores => {

    return {
        principal: {
            nome_popular: valores.nomePopular,
            entidade_id: valores.entidade,
            numero_coleta: valores.numeroColeta,
            data_coleta: {
                dia: valores.dataColetaDia,
                mes: valores.dataColetaMes,
                ano: valores.dataColetaAno,
            },
            cor: valores.localidadeCor,
            tipo_id: valores.tipo,
        },

        localidade: {
            latitude: valores.latitude,
            longitude: valores.longitude,
            altitude: valores.altitude,
            cidade_id: valores.cidade,
            complemento: valores.complemento,
        },
    };
};
