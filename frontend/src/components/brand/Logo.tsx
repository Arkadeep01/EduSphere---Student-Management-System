import logoAsset from "/favicon-edusphere.png";
import faviconAsset from "/favicon-edusphere.png";

export const LOGO_URL = logoAsset;
export const ICON_URL = faviconAsset;

export function Logo({ size = 32, withWordmark = true, invert }: { size?: number; withWordmark?: boolean; invert?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <img src={ICON_URL} alt="EduSphere" width={size} height={size} className="rounded-md" />
      {withWordmark && (
        <span className={`text-lg font-bold tracking-tight ${invert ? "text-white" : ""}`}>
          <span className={invert ? "text-white" : "text-primary"}>Edu</span>
          <span className={invert ? "text-white" : "text-brand"}>Sphere</span>
        </span>
      )}
    </div>
  );
}