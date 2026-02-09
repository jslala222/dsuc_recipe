import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // 따뜻한 주방 컬러 팔레트
                primary: {
                    50: '#f4f9f4',
                    100: '#e6f2e6',
                    200: '#cce5cc',
                    300: '#a3d1a3',
                    400: '#70b570',
                    500: '#4a9d4a', // Olive Green 메인
                    600: '#3d8b3d',
                    700: '#336f33',
                    800: '#2d5a2d',
                    900: '#264a26',
                },
                wood: {
                    50: '#faf8f5',
                    100: '#f5f0e8',
                    200: '#e8dcc8',
                    300: '#d9c4a3',
                    400: '#c9a97a',
                    500: '#b8915a', // Warm Wood 메인
                    600: '#a57a45',
                    700: '#8a6339',
                    800: '#715030',
                    900: '#5d4229',
                },
                cream: {
                    50: '#fefdfb',
                    100: '#fdf9f3',
                    200: '#faf3e6',
                    300: '#f5e8d3',
                    400: '#edd9b8',
                    500: '#e4c99d',
                },
            },
            fontFamily: {
                sans: ['Pretendard', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
export default config;
