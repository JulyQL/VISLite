const fs = require("fs")
const { rollup } = require('rollup')
const { minify } = require("terser")
const rollupConfig = require('./rollup.config.js')
const { error, log, warn } = require('devby')
const package = require("../package.json")

let getFormat = (filename, format) => {
    if (/^Oral/.test(filename)) {
        return "es"
    } else {
        return format
    }
}

fs.writeFileSync("./docs/js/system.js", `window.VISLite_system = {
    "version": "${package.version}"
};`)

let banner = `/*!
* VISLite JavaScript Library v${package.version}
* ${package.repository.url}
*
* Copyright ${package.author.name}
* Released under the ${package.license} license
* ${package.author.url}
*
* Publish Date:  ${new Date()}
*/`

error(`
> Rollup 打包
`)

let sourceFiles = fs.readdirSync("./package")
new Promise((resolve, reject) => {
    (function doRollup(index) {
        if (index >= sourceFiles.length) {
            resolve()
            return
        }

        let folder = sourceFiles[index]

        let folderPath = folder == 'index.ts' ? "" : (folder + "/")
        let folderName = folder == 'index.ts' ? "" : ("_" + folder)

        let sourceFile = "./package/" + folderPath + "index.ts"
        let targetFile = "./lib/" + folderPath + "index." + getFormat(folder, rollupConfig.output.format) + ".js"

        rollup({
            input: sourceFile,
            plugins: rollupConfig.plugins
        }).then(bundle => {
            bundle.write({
                name: "VISLite" + folderName,
                format: getFormat(folder, rollupConfig.output.format),
                banner,
                file: targetFile
            }).then(() => {
                log(`✔ [${index}] ${sourceFile} → ${targetFile}`)
                doRollup(index + 1)
            }).catch((e) => {
                console.log(e)
                reject(`✘ [${index}] ${sourceFile} → ${targetFile} [2]`)
            })
        }).catch((e) => {
            console.log(e)
            reject(`✘ [${index}] ${sourceFile} → ${targetFile} [1]`)
        })
    })(0)
}).then((msg) => {

    error(`
> Terser 压缩混淆
`)

    new Promise((resolve, reject) => {

        (function doTerser(index) {
            if (index >= sourceFiles.length) {
                resolve()
                return
            }

            let folder = sourceFiles[index]

            let folderPath = folder == 'index.ts' ? "" : (folder + "/")

            let sourceFile = "./lib/" + folderPath + "index." + getFormat(folder, rollupConfig.output.format) + ".js"
            let targetFile = "./lib/" + folderPath + "index." + getFormat(folder, rollupConfig.output.format) + ".min.js"


            minify(fs.readFileSync(sourceFile, "utf-8"), {
                toplevel: true,
            }).then((data) => {
                fs.writeFileSync(targetFile, data.code)

                log(`✔ [${index}] ${sourceFile} → ${targetFile}`)
                doTerser(index + 1)
            }).catch((e) => {
                console.log(e)
                error(`✘ [${index}] ${sourceFile} → ${targetFile} [3]`)
                reject()
            })

        })(0)

    }).then(() => {

        warn(`
✔ 完毕
`)

    }).catch((e) => {
        error(`
✘ 失败
`)
        console.log(e)
    })

}).catch((e) => {
    console.log(e)
})
