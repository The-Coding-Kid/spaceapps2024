const Title = ({ title }) => {
  return (
    <div className="bg-[rgba(255,255,255,0.1)] bgblur flex flex-row text-[16px] gap-2 px-8 tracking-wide rounded-full top-[24px] left-[24px] text-[rgba(255,255,255,0.5)] py-3 absolute">
      {/* <h1>
        <span className="font-bold underline">E</span>xoplanet{" "}
        <span className="font-bold underline">I</span>
        nteractive
      </h1> */}

      {/* make first character of each word bold and underlined */}
      {title.split(" ").map((word, i) => (
        <p key={i}>
          <span className="font-bold underline">{word[0]}</span>
          {word.slice(1)}
        </p>
      ))}
    </div>
  );
};

export default Title;
