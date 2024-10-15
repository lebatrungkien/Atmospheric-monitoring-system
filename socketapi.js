const option = {
    allowEIO3: true,
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        transports: ["websocket", "polling"],
        credentials: true,
    },
}
const io = require("socket.io")(option);

const dataModel = require("./models/trungkienDataModel.js");

let dataObj = {
    temp: [],
    humi: [],
    aqi: [],
    co2: [],
    wind: [],
    pm25: [],
    pm10: [],
    pm1: [],
}

let medianObj = {
    temp: 0,
    humi: 0,
    aqi: 0,
    co2: 0,
    wind: 0,
    pm25: 0,
    pm10: 0,
    pm1: 0,
}

const maxLength = 30;
let curLength = 0;


const socketapi = {
    io: io
}

io.on("connection", (socket) => {
    console.log("[INFO] new connection: [" + socket.id + "]",
        socket.request.connection.remoteAddress);
    socket.on("/esp/up-data", async (data) => {
        console.log(`[/esp/envir] from ${data.clientID} via socket id: ${socket.id}`);
        //add data to dataObj
        for (let key in data) {
            if (dataObj[key] == undefined) {
                console.log(`[ERROR] key ${key} is not in dataObj`);
                continue;
            }
            dataObj[key].push(data[key]);
        }
        curLength++;
        console.log(`[INFO] curLength: ${curLength}`);
        if (curLength == maxLength) {
            //when max length reached, calculate median
            for (let key in dataObj) {
                console.log(`[INFO] current data of ${key}: ${dataObj[key]}`)
                medianObj[key] = getMedianFromArr(dataObj[key]).toFixed(2);
                console.log(`[INFO] current median of ${key}: ${medianObj[key]}`);
            }
            //insert to mongodb
            try {
                const newData = new dataModel({
                    temp: medianObj.temp,
                    humi: medianObj.humi,
                    aqi: medianObj.aqi,
                    co2: medianObj.co2,
                    wind: medianObj.wind,
                    pm25: medianObj.pm25,
                    pm10: medianObj.pm10,
                    pm1: medianObj.pm1,
                    createdAt: new Date(),
                    metadata: {
                        height: 100,
                        location: "Hanoi",
                        deviceID: "1"
                    }
                });
                await newData.save();
                //reset array and length
                for (let key in dataObj) {
                    dataObj[key] = [];
                    medianObj[key] = 0;
                }
                curLength = 0;
                socket.broadcast.emit("/web/up-data", newData);
            } catch (err) {
                console.error(err.message);
            }
        }
    });

    socket.on("message", (data) => {
        console.log(`[message] from ${data.clientID} via socket id: ${socket.id}`);
        socket.broadcast.emit("message", data);
    })
    /**************************** */
    //xu ly chung
    socket.on("reconnect", function () {
        console.log("[" + socket.id + "] reconnect.");
    });
    socket.on("disconnect", () => {
        console.log("[" + socket.id + "] disconnect.");
    });
    socket.on("connect_error", (err) => {
        console.log(err.stack);
    });
})

function getMedianFromArr(arr) {
    return arr.reduce((a, b) => +a + +b, 0) / arr.length;
}

module.exports = socketapi;