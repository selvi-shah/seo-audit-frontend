import { useState } from "react";
import API from "../services/api";

export default function Compare() {
  const [urls, setUrls] = useState({ url1: "", url2: "" });
  const [data, setData] = useState<any>(null);

  const handleCompare = async () => {
    try {
      const res = await API.post("/audit/compare", urls);
      setData(res.data);
    } catch (err) {
      alert("Compare failed");
    }
  };

  return (
    <div>
      <h2>Compare SEO</h2>

      <input placeholder="URL 1" onChange={(e) => setUrls({ ...urls, url1: e.target.value })} />
      <input placeholder="URL 2" onChange={(e) => setUrls({ ...urls, url2: e.target.value })} />

      <button onClick={handleCompare}>Compare</button>

      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}