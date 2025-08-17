import { Container, Image, Root, Text } from "@react-three/uikit";
import { Button, Card, Defaults } from "@react-three/uikit-apfel";
import { useXR } from "@react-three/xr";
import { useEffect, useState } from "react";
import { store } from "../App";
import { useSong } from "../hooks/useSong";
import { isIOS, isMobile, supportsARQuickLook } from "../utils/deviceDetection";
import { exportDrumToAR, DRUM_MODELS } from "../utils/usdzExport";
import { MobileVRSimulator } from "../utils/mobileVR";

export function UI() {
  const loadSong = useSong((state) => state.loadSong);
  const songs = useSong((state) => state.songs);
  const mode = useXR((state) => state.mode);
  const session = useXR((state) => state.session);
  const songData = useSong((state) => state.songData);
  const passthrough = useSong((state) => state.passthrough);
  const setPassthrough = useSong((state) => state.setPassthrough);
  const [isXRSupported, setIsXRSupported] = useState(false);
  const [mobileVR, setMobileVR] = useState(null);

  useEffect(() => {
    if (navigator.xr) {
      navigator.xr.isSessionSupported('immersive-ar').then(setIsXRSupported);
    }
  }, []);
  if (songData) {
    return null;
  }
  return (
    <Defaults>
      <Root>
        <Container
          flexDirection="column"
          md={{ flexDirection: "row" }}
          alignItems="center"
          gap={32}
        >
          <Card
            borderRadius={32}
            padding={16}
            flexDirection={"column"}
            alignItems={"center"}
            gap={8}
          >
            <Image
              src="https://imgs.search.brave.com/dZ51H0QMT_Yfi784tjz1pWb14x_OEvM8hJklsMHkx7c/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly8xMDAw/bG9nb3MubmV0L3dw/LWNvbnRlbnQvdXBs/b2Fkcy8yMDIwLzA5/L05hcnV0by1Mb2dv/LTUwMHgyODEucG5n"
              width={150}
              onClick={() => window.open("/", "_blank")}
            />
            <Text
              fontSize={11}
              onClick={() => window.open("/", "_blank")}
            >
              by Leaf Village
            </Text>
            <Container
              flexDirection="column"
              justifyContent="space-between"
              alignItems="stretch"
              gapRow={8}
            >
              <Container flexDirection="row" gap={8}>
                {songs.map((song, idx) => (
                  <Container key={idx} flexDirection="column" gap={4}>
                    <Card
                      onClick={(e) => {
                        e.stopPropagation();
                        loadSong(song);
                      }}
                      hover={{
                        backgroundOpacity: 0.5,
                      }}
                      borderRadius={16}
                      flexDirection={"column"}
                      gap={4}
                      padding={4}
                    >
                      <Image
                        width={142}
                        height={142}
                        objectFit={"cover"}
                        keepAspectRatio={false}
                        borderRadius={16}
                        src={song.thumbnail}
                      />
                      <Text
                        maxWidth={142}
                        fontSize={13}
                        textAlign={"center"}
                        fontWeight={"bold"}
                      >
                        {song.name}
                      </Text>
                    </Card>
                  </Container>
                  // </Button>
                ))}
              </Container>
              <Container
                flexDirection="row"
                justifyContent={"space-evenly"}
                gap={8}
              >
                {mode === null ? (
                  <>
                    {/* iPhone AR Quick Look */}
                    {isIOS() && (
                      <Button
                        variant="rect"
                        size="sm"
                        platter
                        flexGrow={1}
                        onClick={async () => {
                          try {
                            // For iPhone, directly open the AR page with USDZ
                            if (isIOS()) {
                              window.open('/ar/drum-ar.html', '_blank');
                            } else {
                              await exportDrumToAR('drum', 0.3);
                            }
                          } catch (error) {
                            console.error("AR Quick Look Error:", error);
                            alert("Failed to launch AR mode.\nMake sure you're using Safari on iOS 12+ or Chrome with AR support.");
                          }
                        }}
                      >
                        <Text>iPhone AR</Text>
                      </Button>
                    )}
                    
                    {/* Mobile VR Simulation */}
                    {isMobile() && MobileVRSimulator.isSupported() && (
                      <Button
                        variant="rect"
                        size="sm"
                        platter
                        flexGrow={1}
                        onClick={async () => {
                          try {
                            if (!mobileVR) {
                              // Initialize mobile VR (requires camera and renderer from parent)
                              alert("Mobile VR mode requires device orientation permissions.\nTilt your device to look around!");
                              // Note: Would need camera/renderer from React Three Fiber context
                            }
                          } catch (error) {
                            console.error("Mobile VR Error:", error);
                            alert("Mobile VR not supported.\nRequires gyroscope and device orientation permissions.");
                          }
                        }}
                      >
                        <Text>Mobile VR</Text>
                      </Button>
                    )}

                    {/* Standard WebXR */}
                    <Button
                      variant="rect"
                      size="sm"
                      platter
                      flexGrow={1}
                      onClick={async () => {
                        if (!isXRSupported) {
                          alert("WebXR not supported on this device.\n\nRequirements:\n• HTTPS connection (or localhost)\n• Chrome/Edge browser with WebXR enabled\n• VR/AR capable device or headset\n• Enable WebXR flags in chrome://flags");
                          return;
                        }
                        try {
                          await store.enterAR();
                        } catch (error) {
                          console.error("XR Error:", error);
                          alert(`Failed to start AR session: ${error.message}\n\nTroubleshooting:\n• Ensure AR device is connected\n• Check browser permissions\n• Try refreshing the page`);
                        }
                      }}
                    >
                      <Text>{isXRSupported ? "WebXR" : "WebXR (Not Supported)"}</Text>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="rect"
                      size="sm"
                      platter
                      flexGrow={1}
                      onClick={() => setPassthrough(!passthrough)}
                    >
                      <Text>Passthrough</Text>
                    </Button>
                    <Button
                      variant="rect"
                      size="sm"
                      platter
                      flexGrow={1}
                      onClick={() => session.end()}
                    >
                      <Text>Exit VR</Text>
                    </Button>
                  </>
                )}
              </Container>
            </Container>
          </Card>
        </Container>
      </Root>
    </Defaults>
  );
}
