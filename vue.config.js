module.exports = {
    css: {
        loaderOptions: {
            less: {
                lessOptions: {
                    modifyVars: {
                        'primary-color': '#2962ff'
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
