import React, { useCallback, useEffect, useState } from "react";
// import { Link } from "react-router-dom"; // Import Link from react-router-dom for navigation
import { Navigation } from "../components/Navigation";
// import { useSelector } from "react-redux";
// import { RootState } from "../redux/store";
import { FaTemperatureFull } from "react-icons/fa6";
import { TbTemperatureCelsius } from "react-icons/tb";
import { GiWindsock } from "react-icons/gi";
import moment from "moment";

const Home: React.FC = () => {
  // const user = useSelector((state: RootState) => state.auth.user);
  const [position, setPosition] = useState<[number, number]>([0, 0]); // [latitude, longitude
  const [weather, setWeather] = useState<any>(null);
  const [locationData, setLocationData] = useState<any>(null);
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setPosition([position.coords.latitude, position.coords.longitude]);
    });
  }, []);

  const getWeather = useCallback(async () => {
    try {
      const URL = `https://api.open-meteo.com/v1/forecast?latitude=${position[0]}&longitude=${position[1]}&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`;
      const response = await fetch(URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      setWeather(data);
    } catch (error) {
      console.log("Error fetching weather", error);
    }
  }, [position]);
  interface DateTimeDisplayProps {
    isoDate: string;
  }
  const DateTimeDisplay: React.FC<DateTimeDisplayProps> = ({ isoDate }) => {
    const date = moment(isoDate).add(1, "hours");

    const formattedDate = date.format("DD.M.YYYY");
    const formattedTime = date.format("HH:mm");

    return (
      <div>
        <p>
          {formattedDate} {formattedTime}
        </p>
      </div>
    );
  };
  const fetchGeoLocation = useCallback(async () => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position[0]}&lon=${position[1]}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setLocationData(data);
    } catch (error) {
      console.log("Error fetching location", error);
    }
  }, [position]);
  useEffect(() => {
    if (position[0] !== 0 && position[1] !== 0) fetchGeoLocation();
  }, [fetchGeoLocation, position]);
  useEffect(() => {
    if (position[0] !== 0 && position[1] !== 0) getWeather();
  }, [position, getWeather]);
  return (
    <>
      <Navigation />
      <div className=" w-full h-screen bg-gray-900 flex flex-row items-center justify-center">
        <div className="text-center pl-5">
          <h1 className="text-2xl text-sky-600 pb-6">
            Trenutna vremenska prognoza
          </h1>

          <div className="flex flex-col items-center justify-center pb-10">
            <div>
              <h1 className="text-4xl pb-5 text-sky-600">
                {" "}
                {locationData && locationData.address.town}
              </h1>
            </div>
            <div className="flex flex-row">
              <FaTemperatureFull className="text-4xl text-sky-600 mr-10" />
              <h1 className="text-2xl font-bold text-sky-600 ">
                {weather && weather.current.temperature_2m}{" "}
              </h1>
              <TbTemperatureCelsius className="text-4xl text-sky-600" />
            </div>
            <div className="flex flex-row pt-5">
              <GiWindsock className="text-4xl text-sky-600 mr-2" />
              <h1 className="text-2xl font-bold text-sky-600 ">
                {weather && weather.current.wind_speed_10m + " km/h"}{" "}
              </h1>
            </div>
          </div>

          <p className="text-sm text-sky-600 mb-6">
            Latest fetch:
            <>
              {" "}
              {weather && <DateTimeDisplay isoDate={weather.current.time} />}
            </>
          </p>
        </div>
      </div>
    </>
  );
};

export default Home;
