import UserIcon from '../icons/UserIcon';
import BriefcaseIcon from '../icons/BriefcaseIcon';
import CodeIcon from '../icons/CodeIcon';
import GlobeIcon from '../icons/GlobeIcon';
import LayersIcon from '../icons/LayersIcon';
import LifeBuoyIcon from '../icons/LifeBuoyIcon';
import TargetIcon from '../icons/TargetIcon';
import CpuChipIcon from '../icons/CpuChipIcon';

export const avatarOptions = [
    { id: 'user', Component: UserIcon },
    { id: 'briefcase', Component: BriefcaseIcon },
    { id: 'code', Component: CodeIcon },
    { id: 'globe', Component: GlobeIcon },
    { id: 'layers', Component: LayersIcon },
    { id: 'life-buoy', Component: LifeBuoyIcon },
    { id: 'target', Component: TargetIcon },
    { id: 'cpu-chip', Component: CpuChipIcon },
];
export function getAvatarComponent(avatarId) {
    if (!avatarId) return UserIcon;

    const selectedOption = avatarOptions.find(opt => opt.id === avatarId);

    return selectedOption ? selectedOption.Component : UserIcon;
}
