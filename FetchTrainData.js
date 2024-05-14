//Author: Stilian Kolev
//Running the program will create an html file called "train_times.html" in the root folder
//Open it to view the result

const axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs');

const fetchTrainData = async (stationCode , numMins) => {
    const url = `http://api.irishrail.ie/realtime/realtime.asmx/getStationDataByCodeXML_WithNumMins?StationCode=${stationCode}&NumMins=${numMins}&format=xml`;

    try {
        const response = await axios.get(url);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to retrieve data:', error);
        return null;
    }
};

const parseXmlData = async (xmlData) => {
    try {
        const parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: true });
        const result = await parser.parseStringPromise(xmlData);
        return result.ArrayOfObjStationData.objStationData;
    } catch (error) {
        console.error('Error parsing XML:', error);
        return [];
    }
};

const generateHtmlTable = (trainData, stationCode) => {
    let htmlContent = `
<html>
<head>
    <title>Train Times from Irish Rail API</title>
    <style>
        table, th, td {
            border: 1px solid black;
            border-collapse: collapse;
        }
        th, td {
            padding: 10px;
        }
        th {
            text-align: left;
        }
    </style>
</head>
<body>
    <h2>Train Times for Station Code: ${stationCode}</h2>
    <table>
        <tr>
            <th>Expected Arrival Time</th>
            <th>Origin</th>
            <th>Destination</th>
            <th>Expected Departure Time</th>
            <th>Arrival Time at Destination</th>
        </tr>`;

    trainData.forEach(item => {
        htmlContent += `
        <tr>
            <td>${item.Exparrival}</td>
            <td>${item.Origin}</td>
            <td>${item.Destination}</td>
            <td>${item.Expdepart}</td>
            <td>${item.Destinationtime}</td>
        </tr>`;
    });

    htmlContent += `
    </table>
</body>
</html>`;

    fs.writeFileSync('train_times.html', htmlContent);
    console.log('HTML file has been created successfully.');
};

const main = async () => {
    const stationCode = "MHIDE"; // Change this to the station code you want to get data for
    const xmlData = await fetchTrainData(stationCode, 90);
    if (!xmlData) return;

    const trainData = await parseXmlData(xmlData);
    if (trainData.length > 0) {
        generateHtmlTable(trainData, stationCode);
    } else {
        console.log('No train data available.');
    }
};

main();
