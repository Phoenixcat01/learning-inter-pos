import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import JsBarcode from 'jsbarcode';

interface BarcodeViewProps {
  value: string;
  width?: number;
  height?: number;
  showText?: boolean;
}

interface BarSegment {
  isBlack: boolean;
  units: number;
}

/**
 * Komponen visual pembangkit garis barcode Code128 menggunakan React Native <View> murni.
 * Menggunakan jsbarcode sebagai encoder pola biner agar 100% akurat & universal (Expo Go + Web).
 */
export const BarcodeView: React.FC<BarcodeViewProps> = ({
  value,
  width = 2,
  height = 60,
  showText = true,
}) => {
  const segments = useMemo<BarSegment[] | null>(() => {
    const trimmed = value?.trim();
    if (!trimmed) return null;

    try {
      const output: { encodings?: Array<{ data?: string }> } = {};
      JsBarcode(output as unknown as Element, trimmed, {
        format: 'CODE128',
        displayValue: false,
      });

      const binaryData = output.encodings?.[0]?.data;
      if (!binaryData) return null;

      // Run-Length Encoding agar bar yang berdekatan digabung menjadi 1 <View> tajam
      const runs: BarSegment[] = [];
      let currentChar = binaryData[0];
      let count = 1;

      for (let i = 1; i < binaryData.length; i++) {
        if (binaryData[i] === currentChar) {
          count++;
        } else {
          runs.push({ isBlack: currentChar === '1', units: count });
          currentChar = binaryData[i];
          count = 1;
        }
      }
      runs.push({ isBlack: currentChar === '1', units: count });

      return runs;
    } catch {
      return null;
    }
  }, [value]);

  if (!segments) {
    return (
      <View style={styles.errorBox}>
        <Text style={styles.errorText}>Barcode tidak valid</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.barsRow, { height }]}>
        {segments.map((seg, idx) => (
          <View
            key={idx}
            style={{
              width: seg.units * width,
              height,
              backgroundColor: seg.isBlack ? '#000000' : '#ffffff',
            }}
          />
        ))}
      </View>
      {showText && <Text style={styles.codeText}>{value}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20, // Quiet zone agar mudah terbaca scanner dari layar
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: '#ffffff',
  },
  codeText: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: 2,
    color: '#000000',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    fontSize: 11,
    color: '#dc2626',
    fontWeight: '600',
  },
});
