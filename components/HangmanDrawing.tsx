import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

interface HangmanDrawingProps {
  wrongGuesses: number;
}

export function HangmanDrawing({ wrongGuesses }: HangmanDrawingProps) {
  const drawingWidth = 200;
  const drawingHeight = 250;

  return (
    <View style={styles.container}>
      <Svg width={drawingWidth} height={drawingHeight} viewBox="0 0 200 250">
        {/* Base (always visible) */}
        <Line
          x1="10"
          y1="230"
          x2="100"
          y2="230"
          stroke="#fff"
          strokeWidth="4"
          strokeLinecap="round"
        />
        
        {/* Pole (always visible) */}
        <Line
          x1="30"
          y1="230"
          x2="30"
          y2="20"
          stroke="#fff"
          strokeWidth="4"
          strokeLinecap="round"
        />
        
        {/* Top beam (always visible) */}
        <Line
          x1="30"
          y1="20"
          x2="120"
          y2="20"
          stroke="#fff"
          strokeWidth="4"
          strokeLinecap="round"
        />
        
        {/* Noose (always visible) */}
        <Line
          x1="120"
          y1="20"
          x2="120"
          y2="50"
          stroke="#fff"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Head (1st wrong guess) */}
        {wrongGuesses >= 1 && (
          <Circle
            cx="120"
            cy="70"
            r="20"
            stroke="#fff"
            strokeWidth="4"
            fill="none"
          />
        )}

        {/* Body (2nd wrong guess) */}
        {wrongGuesses >= 2 && (
          <Line
            x1="120"
            y1="90"
            x2="120"
            y2="170"
            stroke="#fff"
            strokeWidth="4"
            strokeLinecap="round"
          />
        )}

        {/* Left arm (3rd wrong guess) */}
        {wrongGuesses >= 3 && (
          <Line
            x1="120"
            y1="120"
            x2="80"
            y2="140"
            stroke="#fff"
            strokeWidth="4"
            strokeLinecap="round"
          />
        )}

        {/* Right arm (4th wrong guess) */}
        {wrongGuesses >= 4 && (
          <Line
            x1="120"
            y1="120"
            x2="160"
            y2="140"
            stroke="#fff"
            strokeWidth="4"
            strokeLinecap="round"
          />
        )}

        {/* Left leg (5th wrong guess) */}
        {wrongGuesses >= 5 && (
          <Line
            x1="120"
            y1="170"
            x2="90"
            y2="210"
            stroke="#fff"
            strokeWidth="4"
            strokeLinecap="round"
          />
        )}

        {/* Right leg (6th wrong guess - game over) */}
        {wrongGuesses >= 6 && (
          <Line
            x1="120"
            y1="170"
            x2="150"
            y2="210"
            stroke="#fff"
            strokeWidth="4"
            strokeLinecap="round"
          />
        )}

        {/* Face details when game is over */}
        {wrongGuesses >= 6 && (
          <>
            {/* Eyes (X marks) */}
            <Line
              x1="110"
              y1="65"
              x2="115"
              y2="70"
              stroke="#fff"
              strokeWidth="2"
            />
            <Line
              x1="115"
              y1="65"
              x2="110"
              y2="70"
              stroke="#fff"
              strokeWidth="2"
            />
            <Line
              x1="125"
              y1="65"
              x2="130"
              y2="70"
              stroke="#fff"
              strokeWidth="2"
            />
            <Line
              x1="130"
              y1="65"
              x2="125"
              y2="70"
              stroke="#fff"
              strokeWidth="2"
            />
            
            {/* Mouth (frown) */}
            <Path
              d="M 110 80 Q 120 85 130 80"
              stroke="#fff"
              strokeWidth="2"
              fill="none"
            />
          </>
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
  },
});