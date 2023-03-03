const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const { MessageAttachment, MessageEmbed } = require('discord.js');
const { registerFont } = require("canvas")

module.exports = {
    getTimeGraph : async function getTimeGraph(data) {
    const chartCallback = (ChartJS) => {}
    const width = 1400
    const height = 900
    const canvas = new ChartJSNodeCanvas({
        width,
        height,
        chartCallback,
        backgroundColour: '#222732'
    }, )
    
    registerFont("./assets/CourierPrime-Regular.ttf", { family: "Courier" })
    const image = await canvas.renderToBuffer(getConfig(data))
    const attachment = new MessageAttachment(image)
    return attachment
    }
}

function getConfig(data) {
    background_colours = [
        function (context) {
            const gradient = context.chart.ctx.createLinearGradient(600, 0, 600, 800);
            gradient.addColorStop(0, 'rgba(0, 231, 255, 0.9)')
            gradient.addColorStop(0.5, 'rgba(0, 231, 255, 0.25)');
            gradient.addColorStop(1, 'rgba(0, 231, 255, 0)');
            return gradient;
        },
        function (context) {
            const gradient = context.chart.ctx.createLinearGradient(600, 0, 600, 800);
            gradient.addColorStop(0, 'rgba(255, 0,0, 0.5)')
            gradient.addColorStop(0.5, 'rgba(255, 0, 0, 0.25)');
            gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
            return gradient;
        },
    ]
    let font = 'ShareTech'
    const config = {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [...Array(data.datasets.length).keys()].map(i => {
                    dataset = data.datasets[i]
                    return {
                            label: dataset.username,
                            data: dataset.data,
                            backgroundColor: background_colours[i],
                            borderWidth: 1,
                            pointBackgroundColor: 'white',
                            pointBorderColor: 'white',
                            borderColor: '#05CBE1',
                            fill: true,
                            cubicInterpolationMode: 'monotone',
                            tension: 0.2,
                    }
        }),
            
        },
        options: {
            layout: {
                padding: {
                    right: 40,
                    left: 20,
                    up: 20,
                    bottom: 20,
                }
            },
        plugins : {
            legend: {                        
                display: false,
                labels : {
                    color: 'white',
                    font: {
                        family: font,
                        size: 20,
                        weight: '500',
                    }
                }
            },
            title: {
                display: true,
                text: data.datasets.map(dataset => dataset.username).join(' v ') + 
                ` Mileage (Last ${data.labels.length} ${data.time_unit}s)`,
                font: {
                    size: 30,
                    family: font
                },
                padding: {
                    top: 15,
                    bottom: 20,
                },
                color: 'white',
            }
        },
        scales: {
            y: {
                ticks: {
                    callback: function(value, index, ticks) {
                        return value + 'km';
                    },
                    color: 'white',
                    font: {
                        family: font,
                        size: 20,
                        weight: '500',
                    }
                },
                position: 'left'
            },
            x: {
                ticks: {
                    color: 'white',
                    font: {
                        family: font,
                        size: 20,
                        weight: '500',
                    }
                }
            }
        }
        }
    }
    return config
}