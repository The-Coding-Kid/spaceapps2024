"use client";
import Navbar from "../components/Navbar";
import Title from "../components/Title";
import HomeButton from "../components/Home";

const Calculations = () => {
return (
    <div className="w-[100%]">
        <Title title={"Calculations"} />
        <Navbar />
        <HomeButton />
        <div className="flex flex-col w-[100%] h-[100%] text-lg py-[164px] items-center justify-center">
            <p>
                This{" "}
                <a
                    className="text-blue-300"
                    href="https://docs.google.com/document/d/1WTEqxIBTPOBxeJJuXYxJGoyCgpD9G1F92U8L3W3NvFU/edit?usp=sharing"
                >
                    documentation
                </a>{" "}
                contains all the calculations this website and the interactive are
                based on.
            </p>
            <h1 className="text-2xl mt-[50px]">Formula References</h1>
            {/* add bullet points */}
            <ul className="text-lg mt-4 list-disc">
                <li>
                    <a href="https://geology.humboldt.edu/courses/geology531/531_handouts/penman_approach.pdf">
                        Penman Approach to Evaporation and Evapotranspiration{" "}
                    </a>
                </li>
                <li>
                    <a href="https://www.noaa.gov/jetstream/synoptic/origin-of-wind">
                        Origin of Wind
                    </a>
                </li>
                <li>
                    <a href="https://www.aanda.org/articles/aa/full_html/2023/06/aa45387-22/aa45387-22.html#:~:text=The%20stars%20with%20higher%20metallicities,to%20have%20higher%20iron%20masses">
                        Quantitative correlation of refractory elemental abundances between
                        rocky exoplanets and their host stars
                    </a>
                </li>
                <li>
                    <a href="https://github.com/neilbartlett/color-temperature">
                        Color Temperature
                    </a>
                </li>
                <li>
                    <a href="https://cseligman.com/text/planets/retention.htm">
                        The Retention or Loss of Planetary Atmospheres
                    </a>
                </li>
            </ul>
        </div>
    </div>
);
};

export default Calculations;
