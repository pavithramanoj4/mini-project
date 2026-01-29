import { useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

function App() {
  const [product, setProduct] = useState("");
  const [data, setData] = useState([]);

  const searchProduct = async () => {
    const res = await axios.get(
      `http://127.0.0.1:8000/compare?product=${product}`
    );
    setData(res.data.results);
  };

  const chartData = data.map(item => ({
    name: item.store,
    price: Number(item.price?.replace(/[₹,]/g, "")) || 0
  }));

  const prices = chartData.map(d => d.price);
  const saved = prices.length ? Math.max(...prices) - Math.min(...prices) : 0;

  return (
    <div style={{ padding: 30 }}>
      <h1>🛒 Smart Price Comparison</h1>

      <input
        placeholder="Search any product..."
        value={product}
        onChange={e => setProduct(e.target.value)}
      />
      <button onClick={searchProduct}>Compare</button>

      {saved > 0 && <h3>💰 You save ₹{saved}</h3>}

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="price" />
        </BarChart>
      </ResponsiveContainer>

      <div style={{ display: "flex", gap: 20 }}>
        {data.map((item, i) => (
          <div key={i} style={{ border: "1px solid #ccc", padding: 15 }}>
            <img src={item.image} width="150" />
            <h3>{item.store}</h3>
            <p>{item.title}</p>
            <p>💰 {item.price}</p>
            <p>⭐ {item.rating}</p>
            <a href={item.link} target="_blank">Buy Now</a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;


	
