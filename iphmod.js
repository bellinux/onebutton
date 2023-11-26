import { Haptics, ImpactStyle } from '@capacitor/haptics';

document.addEventListener("touchstart", async (e) => {
    await Haptics.impact({ style: ImpactStyle.Medium });
});
