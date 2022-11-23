import fs from "fs";
import path from "path";

// NB: execute it from the metadata/ folder
function main() {
    for (let i = 0; i < 2; ++i) {
        fs.copyFileSync(path.resolve("./metadata.json"), path.resolve("./", i.toString()));
    }
}

main()