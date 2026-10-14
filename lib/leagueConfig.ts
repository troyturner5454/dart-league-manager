export const leagueConfig = {
  name:
    process.env.NEXT_PUBLIC_LEAGUE_NAME ||
    "CR Wed Darts",

  minHighScore: Number(
    process.env.NEXT_PUBLIC_MIN_HIGH_SCORE || 100
  ),

  maxHighScore: 177,

  minHighCheckout: Number(
    process.env.NEXT_PUBLIC_MIN_HIGH_CHECKOUT || 100
  ),

  maxHighCheckout: 170,
};