import { useEffect, useState } from "react";
import API from "../api";

export default function usePlan() {
  const [plan, setPlan] = useState(null);
  const [features, setFeatures] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/subscriptions/my-plan")
      .then(res => {
        setPlan(res.data.plan);
        setFeatures(res.data.features);
      })
      .catch(() => {
        setPlan("basic");
        setFeatures({});
      })
      .finally(() => setLoading(false));
  }, []);

  const can = (featureKey) => !!features[featureKey];

  return { plan, features, loading, can };
}