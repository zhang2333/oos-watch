exports.cssLoaders = function () {
    const cssLoader = {
        loader: 'css-loader',
        options: {
            minimize: process.env.NODE_ENV === 'production',
        }
    }

    // generate loader string to be used with extract text plugin
    function generateLoaders(loader) {
        const loaders = [{ loader: 'vue-style-loader' }, cssLoader]
        if (loader) {
            loaders.push({
                loader: loader + '-loader'
            })
        }
        return loaders
    }

    // https://vue-loader.vuejs.org/en/configurations/extract-css.html
    return {
        css: generateLoaders(),
        stylus: generateLoaders('stylus'),
        styl: generateLoaders('stylus')
    }
}

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = function () {
    const output = []
    const loaders = exports.cssLoaders()
    for (const extension in loaders) {
        const loader = loaders[extension]
        output.push({
            test: new RegExp('\\.' + extension + '$'),
            use: loader
        })
    }
    return output
}
