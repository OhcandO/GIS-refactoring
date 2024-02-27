'use strict';

module.exports ={
    plugins: ['plugins/markdown'],
    recurseDepth: 10,
    source: {
        include: ['./MO_GIS'],
        includePattern: ".+\\.js(doc|x)?$",
        excludePattern: "(^|\\/|\\\\)_",
    },
    sourceType: "module",
    tags: {
        allowUnknownTags: true,
        dictionaries: ["jsdoc", "closure"],
    },
    templates: {
        cleverLinks: false,
        monospaceLinks: false,
        default:{
            staticFiles:{
                include:['./README']
            }
        },

    },
    opts: {
        encoding: "utf8",
        destination: "./docs/",
        recurse: true,
        readme: "./README.md",
        template: "node_modules/clean-jsdoc-theme",
    },
};
