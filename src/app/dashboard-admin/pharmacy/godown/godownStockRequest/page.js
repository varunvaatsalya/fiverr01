import React, { useState } from "react";

function Page() {
  const [stockRequest, setStockRequests] = useState([]);
  useEffect(() => {
    fetch("/api/stockRequest")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStockRequests(data.requests);
        } else console.log(data.message);
      });
  }, []);
  return <div></div>;
}

export default Page;
