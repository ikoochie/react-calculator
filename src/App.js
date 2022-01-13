import { useState, useCallback, useEffect } from "react";
import ScaleText from "react-scale-text";

function CalculatorOutput({ value }) {
  const language = navigator.language || "en-US";

  let formattedValue = parseFloat(value).toLocaleString(language, {
    useGrouping: true,
    maximumFractionDigits: 6,
  });

  const match = value.match(/\.\d*?(0*)$/);

  if (match) {
    formattedValue += /[1-9]/.test(match[0]) ? match[1] : match[0];
  }
  return (
    <div className="calculator-output">
      <ScaleText>{formattedValue}</ScaleText>
    </div>
  );
}

function CalculatorKey({ ckey, onPress }) {
  return (
    <button className="calculator-key" onClick={() => onPress()}>
      {ckey}
    </button>
  );
}

const CalculatorOperations = {
  "/": (prevValue, nextValue) => prevValue / nextValue,
  "*": (prevValue, nextValue) => prevValue * nextValue,
  "+": (prevValue, nextValue) => prevValue + nextValue,
  "-": (prevValue, nextValue) => prevValue - nextValue,
  "=": (prevValue, nextValue) => nextValue,
};

function App() {
  const [value, setValue] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waiting, setWaiting] = useState(false);
  const [output, setOutput] = useState("0");

  const handleDigit = useCallback(
    (ckey) => {
      if (waiting) {
        setOutput(String(ckey));
        setWaiting(false);
      } else {
        setOutput(output === "0" ? String(ckey) : output + ckey);
      }
    },
    [output, waiting]
  );

  const handleClearOutput = useCallback(() => {
    setValue(null);
    setOutput("0");
    setOperator(null);
    setWaiting(false);
  }, []);

  const handleDot = useCallback(
    (ckey) => {
      if (!/\./.test(output)) {
        setOutput(output + ckey);
      }
    },
    [output]
  );

  const handleDelete = useCallback(() => {
    setOutput(output.substring(0, output.length - 1) || "0");
  }, [output]);

  const handlePercent = useCallback(() => {
    const currentValue = parseFloat(output);

    if (currentValue === 0) return;

    const fixedDigits = output.replace(/^-?\d*\.?/, "");
    const newValue = parseFloat(output) / 100;

    setOutput(String(newValue.toFixed(fixedDigits.length + 2)));
  }, [output]);

  const handleSign = useCallback(() => {
    const currentValue = parseFloat(output);

    if (currentValue === 0) return;

    const newValue = parseFloat(output) * -1;

    setOutput(String(newValue));
  }, [output]);

  const handleOperation = useCallback(
    (nextOperator) => {
      const inputValue = parseFloat(output);

      if (value === null) {
        setValue(inputValue);
      } else if (operator) {
        const currentValue = value || 0;
        const newValue = CalculatorOperations[operator](
          currentValue,
          inputValue
        );

        setValue(newValue || 0);
        setOutput(String(newValue || 0));
      }

      setWaiting(true);
      setOperator(nextOperator);
    },
    [operator, output, value]
  );

  const handleKeyPress = useCallback(
    (event) => {
      let { key } = event;

      if (key === "Enter") key = "=";

      if (/\d/.test(key)) {
        event.preventDefault();
        handleDigit(parseInt(key, 10));
      } else if (key in CalculatorOperations) {
        event.preventDefault();
        handleOperation(key);
      } else if (key === ".") {
        event.preventDefault();
        handleDot(".");
      } else if (key === "%") {
        event.preventDefault();
        handlePercent();
      } else if (key === "Backspace") {
        event.preventDefault();
        handleDelete();
      } else if (key === "Clear" || key === "Delete") {
        event.preventDefault();
        handleClearOutput();
      }
    },
    [
      handleClearOutput,
      handleDelete,
      handleDigit,
      handleDot,
      handleOperation,
      handlePercent,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <div className="container">
      <div id="calculator">
        <CalculatorOutput value={output} />
        <div className="calculator-input">
          <div className="input-left">
            <div className="input-functions">
              <CalculatorKey ckey="AC" onPress={() => handleClearOutput()} />
              <CalculatorKey ckey="⌫" onPress={() => handleDelete()} />
              <CalculatorKey ckey="%" onPress={() => handlePercent()} />
            </div>
            <div className="input-digits">
              <CalculatorKey ckey="±" onPress={() => handleSign()} />
              <CalculatorKey ckey="0" onPress={() => handleDigit("0")} />
              <CalculatorKey ckey="." onPress={() => handleDot(".")} />
              <CalculatorKey ckey="1" onPress={() => handleDigit("1")} />
              <CalculatorKey ckey="2" onPress={() => handleDigit("2")} />
              <CalculatorKey ckey="3" onPress={() => handleDigit("3")} />
              <CalculatorKey ckey="4" onPress={() => handleDigit("4")} />
              <CalculatorKey ckey="5" onPress={() => handleDigit("5")} />
              <CalculatorKey ckey="6" onPress={() => handleDigit("6")} />
              <CalculatorKey ckey="7" onPress={() => handleDigit("7")} />
              <CalculatorKey ckey="8" onPress={() => handleDigit("8")} />
              <CalculatorKey ckey="9" onPress={() => handleDigit("9")} />
            </div>
          </div>
          <div className="input-right">
            <CalculatorKey ckey="÷" onPress={() => handleOperation("/")} />
            <CalculatorKey ckey="×" onPress={() => handleOperation("*")} />
            <CalculatorKey ckey="-" onPress={() => handleOperation("-")} />
            <CalculatorKey ckey="+" onPress={() => handleOperation("+")} />
            <CalculatorKey ckey="=" onPress={() => handleOperation("=")} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
