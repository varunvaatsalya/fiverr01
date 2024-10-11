function Loading({size}) {
    return (
      <>
          <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            className="motion-reduce:hidden animate-spin text-5xl font-bold text-white"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              strokeWidth="10"
              strokeDasharray="210 70"
              strokeLinecap="round"
              className="stroke-current"
            ></circle>
          </svg>
      </>
    );
  }
  
  export default Loading;
  