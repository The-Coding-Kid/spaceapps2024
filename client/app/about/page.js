"use client";
import Navbar from "../components/Navbar";
import Title from "../components/Title";
import HomeButton from "../components/Home";

const About = () => {
    return (
        <div className="w-[100%] flex items-center justify-center">
            <Title title={"About"} />
            <Navbar />
            <HomeButton />
            <div className="flex flex-col w-[40%] h-[100%] text-lg py-[164px] items-center justify-center">
            <h1 className="text-2xl mt-[50px]">What does this app do?</h1>
                <p>Our project is an interactive applet that allows users to view around exoplanets and their systems. We used and derived numerous complicated equations to calculate new and missing parameters for exoplanet data, which can be viewed on the side display of the interactive. Because the positions of stars are different relative to each planet, the night sky is different depending on the planet!</p>
                <br /><br />
                <p>The user can choose:</p>
            <ul className="text-lg mt-4 list-disc">
                <li>
                    The overview of the exoplanet-star system and its orbit
                </li>
                <li>
                   An up-close view of the exoplanet
                </li>
                <li>
                    A realistic view of what it would look like from the surface of the exoplanet! 
                </li>
                </ul>
                <br />
                <br />
                <p>We have over 5500 exoplanets in total. The atmospheres their composition are available for around 2400 of those exoplanets due to currently limited data discovered for exoplanets.</p>
                                <br />
                <br />
                <p>As you experience a realistic view from the surface of the exoplanet, you also see the effect of atmospheric composition on weather systems generated in the planet. Those result in precipitation, winds, and a surface and clouds that block and reflect some of the star’s light (all of which are carefully calculated). </p>
                <br />
                <br />
                <p>Users can also connect and name their vew own constellations in the night sky as viewed from an exoplanet! On top of that, you can see the path of the star across the sky as viewed from the exoplanet (A.K.A. the ecliptic).</p>
                <br />
                <br />
                
        </div>
        </div>
    )
}

export default About