import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import axios, { mapsThirdPartyInstance } from './../services/api-instance';

const WeatherApp = () => {

    const [location, setLocation] = useState('');
    const [startDate, setStartDate] = useState(new Date(new Date().setHours(0)).toISOString().substr(0, 10));
    const [endDate, setEndDate] = useState(new Date(new Date().setHours(23)).toISOString().substr(0, 10));
    const [temperature, setTemperature] = useState(true);
    const [lat, setLat] = useState('');
    const [long, setLong] = useState('');
    const [windSpeed, setWindSpeed] = useState(true);
    const [precipitation, setPrecipitation] = useState(true);
    const [weatherData, setWeatherData] = useState({});
    const [suggestions, setSuggestions] = useState([]);
    const [chartDataset, setChartDataset] = useState([]);

    // Get the current date and set it as the minimum date
    let today = new Date().toISOString().split('T')[0];

    const getWeatherReport = async (e) => {
        if (e)
            e.preventDefault();

        // If any of the parameters are selected, proceed with the API request
        if (temperature || precipitation || windSpeed) {
            let parameters = []
            if (temperature) {
                parameters.push("t_2m:C")
            }
            if (precipitation) {
                parameters.push("precip_1h:mm")
            }
            if (windSpeed) {
                parameters.push("wind_speed_10m:ms")
            }

            // If latitude and longitude are present, fetch the weather data
            if (lat && long) {
                const { data } =
                    await axios.get(`/${new Date(startDate).toISOString()}--${new Date(endDate).toISOString()}:PT1H/${parameters.join(',')}/${lat},${long}/json`);
                setWeatherData(data);
            }
        } else {
            // If none of the parameters are selected, alert the user
            alert("Please select atleast one parameter")
        }
    };

    function handleSelectSuggestion(suggestion) {
        // Update the location state with the selected suggestion's display name
        setLocation(suggestion.display_name);

        // Update the latitude and longitude state variables with the provided values
        setLat(suggestion.lat)
        setLong(suggestion.lon)

        // Clear the suggestions array to hide the search results
        setSuggestions([]);
    }
    useEffect(() => {
        // This sets a timeout of 500 milliseconds to delay the execution of the function
        // to avoid making too many API requests as the user types in the search bar
        setTimeout(() => {
            getLocation();
        }, 500);
    }, [location]);
    useEffect(() => {
        let dataset = []

        // If the temperature state variable is set, add a temperature data object to the dataset array
        if (temperature)
            dataset.push({
                label: 'Temperature (°C)',
                data: getChartData(weatherData, "t_2m:C"),
                borderColor: 'rgba(255, 99, 132, 1)',
                fill: true,
            })

        // If the wind speed state variable is set, add a wind speed data object to the dataset array
        if (windSpeed)
            dataset.push({
                label: 'Wind Speed (km/h)',
                data: getChartData(weatherData, "wind_speed_10m:ms"),
                borderColor: 'rgba(54, 162, 235, 1)',
                fill: true,
            })

        // If the precipitation state variable is set, add a precipitation data object to the dataset array
        if (precipitation)
            dataset.push({
                label: 'Precipitation (mm)',
                data: getChartData(weatherData, "precip_1h:mm"),
                borderColor: 'rgba(255, 206, 86, 1)',
                fill: true,
            })

        // Update the chart dataset state variable with the new dataset
        setChartDataset(dataset)
    }, [weatherData])



    useEffect(() => {
        // Check if geolocation is available in the browser
        if (navigator.geolocation) {

            // Get the current position using the geolocation API
            navigator.geolocation.getCurrentPosition(function ({ coords }) {

                // Set the latitude and longitude state variables with the obtained coordinates
                setLat(coords.latitude);
                setLong(coords.longitude);

                // Call the function to get the location name using the obtained coordinates
                getLocationName(coords.latitude, coords.longitude);
            });
        }
    }, [])
    const getLocationName = async (latitude, longitude) => {
        try {
            // Call a third-party maps API to get the display name of the location from the given latitude and longitude
            const { display_name } = await mapsThirdPartyInstance(`/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);

            // Update the location state variable with the obtained display name
            setLocation(display_name);

            // Update the latitude and longitude state variables with the provided values
            setLat(latitude)
            setLong(longitude)
        } catch (error) {
            // If there's an error, display an alert with the error message
            alert(error)
        }

    }
    const getLocation = async () => {
        // Check if the location state variable is set
        if (location) {
            try {
                // Call a third-party maps API to search for locations matching the provided query
                const { data } = await mapsThirdPartyInstance(`/search?format=json&q=${location}`)

                // Update the suggestions state variable with the obtained search results
                setSuggestions(data)
            } catch (error) {
                // If there's an error, display an alert with the error message
                alert(error)
            }
        }
    }
    const getChartData = ({ data }, parameter) => {
        // Check if the data object is set

        if (data) {
            // Filter the data object to get only the data corresponding to the specified parameter
            let parameterObj = data.filter((data) => data.parameter === parameter)

            // Get the dates object for the first set of coordinates in the filtered parameter object
            let datesObj = parameterObj[0].coordinates[0].dates;

            // If the dates object is set, return an array of the values for each date
            if (datesObj)
                return datesObj.map(date => date.value)
            else
                return []
        }
    }
    useEffect(() => {
        // Call the function to get the weather report data whenever the latitude, longitude, temperature, wind speed, or precipitation state variables change
        getWeatherReport()
    }, [lat, long, temperature, windSpeed, precipitation]);
    const format = (number) => {
        return number < 9 ? ('0' + number) : number
    }
    const chartData = {

        // If weatherData.data exists, generate labels based on its first coordinates and dates.
        labels: weatherData.data ? weatherData.data[0].coordinates[0].dates.map(date => {
            let dateObj = new Date(date.date)
            return format(dateObj.getUTCDate()) + "/" + format(dateObj.getUTCMonth() + 1) + "/" + dateObj.getUTCFullYear() + " " + format(dateObj.getUTCHours()) + ":" + format(dateObj.getUTCMinutes())
            // return datObj.toTimeString().split(' ')[0]
        }) : [],
        // The datasets property contains the actual data that will be displayed in the chart.
        datasets: chartDataset,
    };


    // These are the options for the Charts
    const options = {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
            legend: {
                display: false
            },
        },
    };



    return (
        <div className='container'>
            <form onSubmit={getWeatherReport} className="search-filters">
                <div className="icon-input">
                    {/* <label htmlFor="location">Location:</label> */}
                    <input placeholder="Location" className="icon-input__text-field" type="text" value={location} onChange={(e) => setLocation(e.target.value)} required />
                    {/* <AiOutlineSearc h className="icon-input__icon material-icons" /> */}
                    {suggestions && suggestions.length > 0 ? (
                        <ul>
                            {suggestions.map(suggestion => (
                                <li key={suggestion.place_id} onClick={() => handleSelectSuggestion(suggestion)}>
                                    {/* <img src={suggestion.icon} alt="img" />  */}
                                    <span>{suggestion.display_name}</span>
                                </li>
                            ))}
                        </ul>
                    ) : ''}
                </div>
                <div className="icon-input">
                    <label >Start Date:</label>
                    <input type="date" value={startDate} min={today} placeholder="start Date" onChange={(e) => setStartDate(e.target.value)} required />
                </div>
                <div className="icon-input">
                    <label >End Date:</label>
                    <input type="date" value={endDate} min={today} onChange={(e) => setEndDate(e.target.value)} required />
                </div>
                <button type="submit">Get Weather Data</button>
            </form>


            <div className='chart-filters'>
                <form>
                    <p>Parameters</p>
                    <div className="form-group pink">
                        <label className="container-checkbox"> Temperature
                            <input type="checkbox" checked={temperature} disabled={!windSpeed && !precipitation} onChange={(e) => setTemperature(e.target.checked)} />
                            <span className="checkmark"></span>     </label>
                    </div>
                    <div className="form-group accent">
                        <label className="container-checkbox">   Wind Speed
                            <input type="checkbox" checked={windSpeed} disabled={!temperature && !precipitation} onChange={(e) => setWindSpeed(e.target.checked)} /> <span className="checkmark"></span>
                        </label>
                    </div>
                    <div className="form-group amber">
                        <label className="container-checkbox">
                            Precipitation <input name="prec" type="checkbox" checked={precipitation} disabled={!windSpeed && !temperature} onChange={(e) => setPrecipitation(e.target.checked)} /> <span className="checkmark"></span>

                        </label>
                    </div>
                </form>
                {weatherData.data ? <div >
                    <Line data={chartData} options={options} />
                </div> : ''}
            </div>
        </div >
    );
}

export default WeatherApp;
