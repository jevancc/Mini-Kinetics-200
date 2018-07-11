const fs = require("fs");
const path = require("path");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const kinetics_400 = {
    train: require(path.join(__dirname, "./data/kinetics_train.json")),
    val: require(path.join(__dirname, "./data/kinetics_val.json"))
};

let kinetics_200 = {
    train: fs.readFileSync(path.join(__dirname, "./train_ytid_list.txt"), 'utf8')
        .split('\n').map((s) => s.trim()),
    val: fs.readFileSync(path.join(__dirname, "./val_ytid_list.txt"), 'utf8')
        .split('\n').map((s) => s.trim())
};

for (let i of ["train", "val"]) {
    let dataList = kinetics_200[i]
        .filter((ytid) => ytid && ytid.length == 11)
        .map((ytid) => {
            if (!kinetics_400[i][ytid]) {
                throw new Error(`Youtube id "${ytid}" is not found in Kinetics 600 ${i}`);
            }

            let video = kinetics_400[i][ytid];
            return {
                label: video.annotations.label,
                youtube_id: ytid,
                time_start: video.annotations.segment[0],
                time_end: video.annotations.segment[1],
                split: video.subset
            };
        });

    createCsvWriter({
        path: `./build/kinetics_200_${i}.csv`,
        header: [
            {id: 'label', title: 'label'},
            {id: 'youtube_id', title: 'youtube_id'},
            {id: 'time_start', title: 'time_start'},
            {id: 'time_end', title: 'time_end'},
            {id: 'split', title: 'split'},
        ]
    }).writeRecords(dataList)
        .then(() => {
            console.log(`...Done ./build/kinetics_200_${i}.csv`);
        });
}
