import logoAsset from "/favicon-edusphere.png";
import faviconAsset from "/favicon-edusphere.png";

export const LOGO_URL = logoAsset;
export const ICON_URL = faviconAsset;

export function Logo({ size = 32, withWordmark = true }: { size?: number; withWordmark?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <img src={ICON_URL} alt="EduSphere" width={size} height={size} className="rounded-md" />
      {withWordmark && (
        <span className="text-lg font-bold tracking-tight">
          <span className="text-primary">Edu</span>
          <span className="text-brand">Sphere</span>
        </span>
      )}
    </div>
  );
}