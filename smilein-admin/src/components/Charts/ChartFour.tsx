import { ApexOptions } from 'apexcharts';
import React, { useState } from 'react';
import ReactApexChart from 'react-apexcharts';

const ChartFour: React.FC = () => {
    const [state] = useState({
        series: [
            {
                name: "Received Amount",
                data: [2, 15, 35, 42, 38, 52, 63, 48, 65, 73, 62, 75],
                color: "#3B82F6",
            },
            {
                name: "Due Amount",
                data: [15, 12, 25, 30, 28, 78, 82, 68, 85, 92, 75, 72],
                color: "#93C5FD",
            },
        ]
    });

    const options: ApexOptions = {
        chart: {
            type: 'area',
            fontFamily: 'Satoshi, sans-serif',
            height: 350,
            width: '100%',
            toolbar: {
                show: false
            },
            zoom: {
                enabled: false
            }
        },
        colors: ['#3B82F6', '#93C5FD'],
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth',
            width: 2
        },
        grid: {
            show: true,
            borderColor: '#E5E7EB',
            strokeDashArray: 3,
            xaxis: {
                lines: {
                    show: false
                }
            }
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.15,
                opacityTo: 0,
                stops: [0, 90, 100]
            }
        },
        xaxis: {
            categories: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
            labels: {
                style: {
                    colors: '#6B7280',
                    fontSize: '12px'
                }
            },
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: '#6B7280',
                    fontSize: '12px'
                },
                formatter: function (value) {
                    return value.toFixed(0);
                }
            },
            min: 0,
            max: 100,
            tickAmount: 5
        },
        legend: {
            show: false
        },
        tooltip: {
            x: {
                show: false
            }
        }
    };

    return (
        <div className="w-full rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-black dark:text-white">
                        Profitability Reports:
                    </h2>
                    <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-2">SHORT BY:</span>
                        <div className="relative z-20 inline-block">
                            <select
                                name=""
                                id=""
                                className="relative z-20 inline-flex appearance-none bg-transparent py-1 pl-3 pr-8 text-sm font-medium outline-none"
                            >
                                <option value="">Monthly</option>
                                <option value="">Yearly</option>
                            </select>
                            <span className="absolute right-3 top-1/2 z-10 -translate-y-1/2">
                                <svg
                                    width="10"
                                    height="6"
                                    viewBox="0 0 10 6"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M0.47072 1.08816C0.47072 1.02932 0.500141 0.955772 0.54427 0.911642C0.647241 0.808672 0.809051 0.808672 0.912022 0.896932L4.85431 4.60386C4.92785 4.67741 5.06025 4.67741 5.14851 4.60386L9.09079 0.896932C9.19376 0.793962 9.35557 0.808672 9.45854 0.911642C9.56151 1.01461 9.5468 1.17642 9.44383 1.27939L5.50155 4.98632C5.22206 5.23639 4.78076 5.23639 4.51598 4.98632L0.558981 1.27939C0.50014 1.22055 0.47072 1.16171 0.47072 1.08816Z"
                                        fill="#637381"
                                    />
                                </svg>
                            </span>
                        </div>
                    </div>
                </div>

                <div className="min-h-[355px] w-full">
                    <ReactApexChart
                        options={options}
                        series={state.series}
                        type="area"
                        height={355}
                        width="100%"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6 border-t pt-6 justify-center items-center text-center">
                    <div>
                        <h3 className="text-gray-500 text-sm font-medium mb-2">Received Amount</h3>
                        <p className="text-2xl font-semibold text-gray-900 dark:text-white">$45,070.00</p>
                    </div>
                    <div>
                        <h3 className="text-gray-500 text-sm font-medium mb-2">Due Amount</h3>
                        <p className="text-2xl font-semibold text-gray-900 dark:text-white">$32,400.00</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ChartFour;