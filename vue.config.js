module.exports = {
    pluginOptions: {
        electronBuilder: {
            nodeIntegration: true
        }
    },
    lintOnSave: false,
    css: {
        loaderOptions: {
            less: {
                lessOptions: {
                    modifyVars: {
                        'primary-color': '#727cf5'
                    },
                    javascriptEnabled: true
                }
            }
        }
    }
}
