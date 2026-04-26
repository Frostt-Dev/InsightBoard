/**
 * Anomaly detection using the IQR (Interquartile Range) method.
 * Returns a Set of indices that are outliers.
 */
export function detectAnomalies(data, valueKey = 'value') {
  if (!data || data.length < 4) return new Set();

  const values = data
    .map((d, i) => ({ val: Number(d[valueKey]), idx: i }))
    .filter(d => !isNaN(d.val));

  if (values.length < 4) return new Set();

  values.sort((a, b) => a.val - b.val);

  const q1Idx = Math.floor(values.length * 0.25);
  const q3Idx = Math.floor(values.length * 0.75);
  const q1 = values[q1Idx].val;
  const q3 = values[q3Idx].val;
  const iqr = q3 - q1;

  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  const anomalyIndices = new Set();
  values.forEach(({ val, idx }) => {
    if (val < lowerBound || val > upperBound) {
      anomalyIndices.add(idx);
    }
  });

  return anomalyIndices;
}

/**
 * Returns a color array for chart data where anomalies are red
 */
export function getAnomalyColors(data, defaultColor = '#6366f1', anomalyColor = '#ef4444', valueKey = 'value') {
  const anomalies = detectAnomalies(data, valueKey);
  return data.map((_, i) => anomalies.has(i) ? anomalyColor : defaultColor);
}
