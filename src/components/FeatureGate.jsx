import usePlan from "../hooks/usePlan";

export default function FeatureGate({ feature, children, fallback = null }) {
  const { can, plan, loading } = usePlan();

  if (loading) return null;

  if (!can(feature)) {
    return fallback ?? (
      <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
        🔒 This feature is not available in your <strong className="capitalize mx-1">{plan}</strong> plan. Please upgrade to access it.
      </div>
    );
  }

  return children;
}