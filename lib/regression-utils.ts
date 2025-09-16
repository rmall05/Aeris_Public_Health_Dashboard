// Simple linear regression implementation
export function linearRegression(x: number[], y: number[]): { slope: number; intercept: number; r2: number } {
  const n = x.length

  // Calculate means
  const meanX = x.reduce((sum, val) => sum + val, 0) / n
  const meanY = y.reduce((sum, val) => sum + val, 0) / n

  // Calculate slope and intercept
  let numerator = 0
  let denominator = 0

  for (let i = 0; i < n; i++) {
    numerator += (x[i] - meanX) * (y[i] - meanY)
    denominator += (x[i] - meanX) ** 2
  }

  const slope = numerator / denominator
  const intercept = meanY - slope * meanX

  // Calculate R-squared
  const yPredicted = x.map((xVal) => slope * xVal + intercept)
  const totalSumSquares = y.reduce((sum, yVal) => sum + (yVal - meanY) ** 2, 0)
  const residualSumSquares = y.reduce((sum, yVal, i) => sum + (yVal - yPredicted[i]) ** 2, 0)
  const r2 = 1 - residualSumSquares / totalSumSquares

  return { slope, intercept, r2 }
}

// Predict future values based on regression model
export function predictFutureValues(
  model: { slope: number; intercept: number },
  startYear: number,
  numYears: number,
): number[] {
  const predictions: number[] = []

  for (let i = 0; i < numYears; i++) {
    const year = startYear + i
    const predictedValue = model.slope * year + model.intercept
    predictions.push(Math.round(predictedValue))
  }

  return predictions
}

// Calculate confidence interval for predictions
export function calculateConfidenceIntervals(
  x: number[],
  y: number[],
  model: { slope: number; intercept: number },
  futureX: number[],
  confidenceLevel = 0.95,
): { lower: number[]; upper: number[] } {
  const n = x.length
  const yPredicted = x.map((xVal) => model.slope * xVal + model.intercept)

  // Calculate standard error of the estimate
  const residuals = y.map((yVal, i) => yVal - yPredicted[i])
  const sumSquaredResiduals = residuals.reduce((sum, res) => sum + res * res, 0)
  const standardError = Math.sqrt(sumSquaredResiduals / (n - 2))

  // Calculate mean of x values
  const meanX = x.reduce((sum, val) => sum + val, 0) / n

  // Calculate sum of squared deviations
  const sumSquaredDeviations = x.reduce((sum, val) => sum + (val - meanX) ** 2, 0)

  // t-value for 95% confidence (approximation)
  const tValue = 2.0 // Approximation for 95% confidence with n > 5

  // Calculate confidence intervals for each prediction
  const lower: number[] = []
  const upper: number[] = []

  for (const xVal of futureX) {
    // Standard error of prediction
    const standardErrorOfPrediction = standardError * Math.sqrt(1 + 1 / n + (xVal - meanX) ** 2 / sumSquaredDeviations)

    // Margin of error
    const marginOfError = tValue * standardErrorOfPrediction

    // Predicted value
    const predictedValue = model.slope * xVal + model.intercept

    // Confidence interval
    lower.push(Math.round(predictedValue - marginOfError))
    upper.push(Math.round(predictedValue + marginOfError))
  }

  return { lower, upper }
}
