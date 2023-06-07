const fs = require("fs")
const { rollup } = require('rollup')
const { minify } = require("terser")
const rollupConfig = require('./rollup.config.js')
const { error, log, warn } = require('devby/src/log.js')
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
* ${/^\d+\.\d+\.\d+$/.test(package.version) ? ('Publish Date: ' + new Date()) : `本版本系测试版本，请认真阅读下述说明再使用：
*
*【测试版本细则】
* alpha：内测版本，仅供开发人员提供测试环境而发布，后续的修改可能极具破坏性，非有明确了解前请勿直接用于项目中
* beta：外测版本，正式发布前的确认测试，或者新功能紧急发布，一般可以直接用于实际项目，因为即使后续发现了问题，直接使用正式版即可，不会有破坏性`}
*/`

error(`
> Rollup 打包
`)

let rollupPromise_rollup = []
fs.readdirSync("./package").forEach((folder, index) => {

    let folderPath = folder == 'index.ts' ? "" : (folder + "/")
    let folderName = folder == 'index.ts' ? "" : ("_" + folder)

    let sourceFile = "./package/" + folderPath + "index.ts"
    let targetFile = "./lib/" + folderPath + "index." + getFormat(folder, rollupConfig.output.format) + ".js"

    rollupPromise_rollup.push(new Promise((resolve, reject) => {
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
                resolve([index, folder])
            }).catch((e) => {
                error(`✘ [${index}] ${sourceFile} → ${targetFile} [2]`)
                resolve([-1, e])
            })
        }).catch((e) => {
            error(`✘ [${index}] ${sourceFile} → ${targetFile} [1]`)
            resolve([-1, e])
        })
    }))
})

let rollupPromise_terser = []
Promise.all(rollupPromise_rollup).then((folders) => {


    error(`
> Terser 压缩混淆
`)

    folders.forEach(folderInfo => {

        let folder = folderInfo[1]
        let index = folderInfo[0]

        if (index == -1) {
            rollupPromise_terser.push(Promise.reject(folder))
        } else {

            let folderPath = folder == 'index.ts' ? "" : (folder + "/")

            let sourceFile = "./lib/" + folderPath + "index." + getFormat(folder, rollupConfig.output.format) + ".js"
            let targetFile = "./lib/" + folderPath + "index." + getFormat(folder, rollupConfig.output.format) + ".min.js"

            rollupPromise_terser.push(new Promise((resolve, reject) => {

                minify(fs.readFileSync(sourceFile, "utf-8"), {
                    toplevel: true,
                }).then((data) => {
                    fs.writeFileSync(targetFile, data.code)

                    log(`✔ [${index}] ${sourceFile} → ${targetFile}`);
                    resolve()
                }).catch(() => {
                    error(`✘ [${index}] ${sourceFile} → ${targetFile} [3]`);
                    reject()
                })

            }))

        }

    })

    Promise.all(rollupPromise_terser).then(() => {

        warn(`
✔ 完毕
`)

    }).catch((e) => {
        error(`
✘ 失败
`)
        console.log(e)
    })

})
