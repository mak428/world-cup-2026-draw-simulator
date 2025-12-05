export default function handler(req, res) {
  // run your Node version of simulateDrawWithSteps here
  const result = simulateDrawWithStepsNode(); // you’d port your logic
  res.status(200).json(result);
}