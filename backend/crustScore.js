function validateInputs(inputs) {
  const requiredKeys = [
    "title_clarity", "approvals_complete", "location_tier", "infra_distance_km",
    "absorption_rate", "market_demand", "cibil_score", "commercial_score",
    "net_worth_cr", "debt_equity_ratio", "pat_margin", "defaults", "dpd_days",
    "unit_pricing_cr", "projected_cashflow_cr", "loan_obligation_cr",
    "cash_reserves_cr", "escrow", "financial_crimes", "developer_contribution_pct",
    "project_cost_cr"
  ];

  for (const key of requiredKeys) {
    if (!(key in inputs)) {
      throw new Error(`Missing input: ${key}`);
    }
  }

  if (inputs.cibil_score < 300 || inputs.cibil_score > 900) {
    throw new Error("CIBIL score must be between 300 and 900");
  }
  if (inputs.absorption_rate < 0 || inputs.absorption_rate > 1) {
    throw new Error("Absorption rate must be between 0 and 1");
  }
  if (inputs.developer_contribution_pct < 0 || inputs.developer_contribution_pct > 1) {
    throw new Error("Developer contribution must be between 0 and 1");
  }
  return true;
}

function checkRedFlags(inputs) {
  const redFlags = [];
  if (inputs.title_clarity === "disputed") {
    redFlags.push("Title dispute/legal litigation detected");
  }
  if (inputs.financial_crimes === "yes") {
    redFlags.push("Financial crimes detected");
  }
  if (inputs.developer_contribution_pct < 0.15) {
    redFlags.push(`Developer contribution (${(inputs.developer_contribution_pct * 100).toFixed(1)}%) is less than 15%`);
  }
  return redFlags;
}

function mapInputsToScores(inputs) {
  const scores = {};

  // A1: Pre-Development Value (15%)
  if (inputs.title_clarity === "clean" && inputs.approvals_complete === "yes") {
    scores.A1 = 10;
  } else if (inputs.title_clarity === "clean" && inputs.approvals_complete === "partial") {
    scores.A1 = 8;
  } else if (inputs.title_clarity === "encumbered") {
    scores.A1 = 5;
  } else {
    scores.A1 = 2;
  }

  // A2: Site Potential (10%)
  if (inputs.location_tier === "Tier-1" && inputs.infra_distance_km < 2) {
    scores.A2 = 10;
  } else if ((inputs.location_tier === "Tier-1" || inputs.location_tier === "Tier-2") && inputs.infra_distance_km < 5) {
    scores.A2 = 8;
  } else if (inputs.location_tier === "Tier-2") {
    scores.A2 = 5;
  } else {
    scores.A2 = 3;
  }

  // A3: Post-Development Value (10%)
  if (inputs.absorption_rate > 0.8 && inputs.market_demand === "high") {
    scores.A3 = 10;
  } else if (inputs.absorption_rate > 0.6) {
    scores.A3 = 8;
  } else if (inputs.absorption_rate > 0.4) {
    scores.A3 = 5;
  } else {
    scores.A3 = 3;
  }

  // B1: Personal Credit Score (10%)
  if (inputs.cibil_score >= 750) {
    scores.B1 = 10;
  } else if (inputs.cibil_score >= 700) {
    scores.B1 = 8;
  } else if (inputs.cibil_score >= 650) {
    scores.B1 = 5;
  } else {
    scores.B1 = 2;
  }

  // B2: Commercial Credit Score (5%)
  if (inputs.commercial_score >= 750) {
    scores.B2 = 10;
  } else if (inputs.commercial_score >= 700) {
    scores.B2 = 8;
  } else if (inputs.commercial_score >= 650) {
    scores.B2 = 5;
  } else {
    scores.B2 = 2;
  }

  // B3: Personal Financials (5%)
  if (inputs.net_worth_cr > 5) {
    scores.B3 = 10;
  } else if (inputs.net_worth_cr >= 2) {
    scores.B3 = 8;
  } else if (inputs.net_worth_cr >= 0) {
    scores.B3 = 5;
  } else {
    scores.B3 = 3;
  }

  // B4: Corporate Financials (10%)
  if (inputs.debt_equity_ratio < 1.5 && inputs.pat_margin > 0.10) {
    scores.B4 = 10;
  } else if (inputs.debt_equity_ratio < 2.0 && inputs.pat_margin > 0.05) {
    scores.B4 = 8;
  } else if (inputs.debt_equity_ratio < 3.0) {
    scores.B4 = 5;
  } else {
    scores.B4 = 3;
  }

  // B5: Repayment History (10%)
  if (inputs.defaults === 0 && inputs.dpd_days === 0 && inputs.financial_crimes === "no") {
    scores.B5 = 10;
  } else if (inputs.dpd_days <= 30) {
    scores.B5 = 8;
  } else if (inputs.dpd_days <= 60) {
    scores.B5 = 5;
  } else {
    scores.B5 = 3;
  }

  // C1: Projected Revenue (10%)
  if (inputs.absorption_rate > 0.8 && inputs.unit_pricing_cr > 0.1) {
    scores.C1 = 10;
  } else if (inputs.absorption_rate > 0.6) {
    scores.C1 = 8;
  } else if (inputs.absorption_rate > 0.4) {
    scores.C1 = 5;
  } else {
    scores.C1 = 3;
  }

  // C2: Repayment Coverage Ratio (10%)
  const repayment_ratio = inputs.loan_obligation_cr > 0 ? inputs.projected_cashflow_cr / inputs.loan_obligation_cr : 0;
  if (repayment_ratio > 2.0) {
    scores.C2 = 10;
  } else if (repayment_ratio >= 1.5) {
    scores.C2 = 8;
  } else if (repayment_ratio >= 1.0) {
    scores.C2 = 5;
  } else {
    scores.C2 = 2;
  }

  // C3: Liquidity Buffer (5%)
  if (inputs.cash_reserves_cr > 0.5 && inputs.escrow === "yes") {
    scores.C3 = 10;
  } else if (inputs.cash_reserves_cr > 0.2) {
    scores.C3 = 8;
  } else if (inputs.cash_reserves_cr > 0.1) {
    scores.C3 = 5;
  } else {
    scores.C3 = 3;
  }

  return scores;
}

function calculateAssetScore(a1, a2, a3) {
  // Return the average of the three asset subscores (0-10 scale)
  return (a1 + a2 + a3) / 3;
}

function calculateBehaviourScore(b1, b2, b3, b4, b5) {
  // Return the average of the five behaviour subscores (0-10 scale)
  return (b1 + b2 + b3 + b4 + b5) / 5;
}

function calculateCashflowScore(c1, c2, c3) {
  // Return the average of the three cashflow subscores (0-10 scale)
  return (c1 + c2 + c3) / 3;
}

function calculateCrustScore(inputs) {
  // Check if direct A1-C3 scores are provided (from frontend inputs)
  if (
    'a1' in inputs && 'a2' in inputs && 'a3' in inputs &&
    'b1' in inputs && 'b2' in inputs && 'b3' in inputs && 'b4' in inputs && 'b5' in inputs &&
    'c1' in inputs && 'c2' in inputs && 'c3' in inputs
  ) {
    // Log inputs to debug
    console.log('Direct inputs received:', inputs);

    // Use provided scores to calculate section averages
    const aScore = calculateAssetScore(inputs.a1, inputs.a2, inputs.a3);
    const bScore = calculateBehaviourScore(inputs.b1, inputs.b2, inputs.b3, inputs.b4, inputs.b5);
    const cScore = calculateCashflowScore(inputs.c1, inputs.c2, inputs.c3);

    // Log calculated section scores
    console.log('Calculated section scores (raw):', { aScore, bScore, cScore });

    // Calculate composite score from average section scores using specified weights
    let compositeScore = (aScore * 0.35) + (bScore * 0.40) + (cScore * 0.25);
    compositeScore = Math.max(0, Math.min(10, compositeScore)); // Ensure score is within 0-10 range
    compositeScore = parseFloat(compositeScore.toFixed(1)); // Format composite score to 1 decimal place

    // Determine Rating and Risk Level based on the composite score
    let rating, risk;
    if (compositeScore >= 9.0) {
      rating = "A+"; risk = "Very Low";
    } else if (compositeScore >= 8.0) {
      rating = "A"; risk = "Low";
    } else if (compositeScore >= 7.0) {
      rating = "B+"; risk = "Moderate";
    } else if (compositeScore >= 6.0) {
      rating = "B"; risk = "Elevated";
    } else if (compositeScore >= 5.0) {
      rating = "C"; risk = "High";
    } else {
      rating = "D"; risk = "Very High";
    }

    // Return formatted scores and other results
    return {
      success: true,
      compositeScore: compositeScore,
      rating: rating,
      risk: risk,
      aScore: parseFloat(aScore.toFixed(1)), // Format Asset Score to 1 decimal place
      bScore: parseFloat(bScore.toFixed(1)), // Format Behaviour Score to 1 decimal place
      cScore: parseFloat(cScore.toFixed(1)), // Format Cashflow Score to 1 decimal place
    };
  }

  // Otherwise, use the mapping logic from raw inputs
  validateInputs(inputs);
  const redFlags = checkRedFlags(inputs);
  const scores = mapInputsToScores(inputs);
  const aScore = calculateAssetScore(scores.A1, scores.A2, scores.A3);
  const bScore = calculateBehaviourScore(scores.B1, scores.B2, scores.B3, scores.B4, scores.B5);
  const cScore = calculateCashflowScore(scores.C1, scores.C2, scores.C3);

  // Calculate composite score from average section scores using specified weights
  let compositeScore = (aScore * 0.35) + (bScore * 0.40) + (cScore * 0.25);
  compositeScore = Math.max(0, Math.min(10, compositeScore)); // Ensure score is within 0-10 range
  compositeScore = Math.round(compositeScore * 100) / 100; // Round to 2 decimal places

  // Determine Rating and Risk Level based on the composite score and red flags
  let rating, risk;
  if (redFlags.length > 0) {
    compositeScore = 0; // Score is 0 if there are red flags
    rating = "D"; risk = "Very High";
  } else if (compositeScore >= 9.0) {
    rating = "A+"; risk = "Very Low";
  } else if (compositeScore >= 8.0) {
    rating = "A"; risk = "Low";
  } else if (compositeScore >= 7.0) {
    rating = "B+"; risk = "Moderate";
  } else if (compositeScore >= 6.0) {
    rating = "B"; risk = "Elevated";
  } else if (compositeScore >= 5.0) {
    rating = "C"; risk = "High";
  } else {
    rating = "D"; risk = "Very High";
  }

  return {
    compositeScore,
    rating,
    risk,
    redFlags,
    aScore,
    bScore,
    cScore,
    componentScores: scores
  };
}

module.exports = { calculateCrustScore };