import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
// @ts-ignore
import * as random from 'maath/random/dist/maath-random.esm';

function Stars() {
    const ref = useRef<any>(null);
    // Reduced star count for better performance
    const sphere = useMemo(() => random.inSphere(new Float32Array(3000), { radius: 1.5 }), []);

    useFrame((_state, delta) => {
        if (ref.current) {
            ref.current.rotation.x -= delta / 20;
            ref.current.rotation.y -= delta / 25;
        }
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={sphere} stride={3} frustumCulled>
                <PointMaterial
                    transparent
                    color="#00f2fe"
                    size={0.002}
                    sizeAttenuation={true}
                    depthWrite={false}
                />
            </Points>
        </group>
    );
}

export const CanvasBackground = () => {
    return (
        <div className="canvas-container" style={{ position: 'fixed', inset: 0, zIndex: -1 }}>
            {/* Added performance optimization flags to Canvas */}
            <Canvas
                camera={{ position: [0, 0, 1] }}
                gl={{ antialias: false, powerPreference: "high-performance" }}
                dpr={[1, 2]} // Limit pixel ratio
            >
                <Stars />
            </Canvas>
        </div>
    );
};
