let csvPath = '../data/data.csv';

d3.csv(csvPath, (error, data) => {
    if (error) console.warn(error);

    console.log(data);
});