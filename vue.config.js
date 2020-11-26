module.exports = {
    css: {
        loaderOptions: {
            less: {
                lessOptions: {
                    modifyVars: {
                        'primary-color': '#4a88c7'
                    },
                    javascriptEnabled: true
                }
            }
        }
    },
    pluginOptions: {
        electronBuilder: {
            nodeIntegration: true
        }
    },
    lintOnSave: false,

}
