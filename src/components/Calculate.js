import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './Calculate.css';

function Calculate() {
    const [calculationData, setCalculationData] = useState({
        from: '',
        to: '',
        days: 1,
        isAC: false,
        passengers: 50
    });

    const [calcDisplay, setCalcDisplay] = useState('0');
    const [prevValue, setPrevValue] = useState(null);
    const [operation, setOperation] = useState(null);
    const [waitingForNewValue, setWaitingForNewValue] = useState(false);
    const [memory, setMemory] = useState(0);

    const destinations = {
        from: ['Karur', 'Namakkal', 'Salem', 'Trichy', 'Erode'],
        to: ['Kodaikanal', 'Ooty', 'Munnar', 'Valparai']
    };

    const baseRates = {
        'Kodaikanal': 50000,
        'Ooty': 55000,
        'Munnar': 65000,
        'Valparai': 52000
    };

    const calculateTotal = () => {
        if (!calculationData.from || !calculationData.to) return 0;

        let total = baseRates[calculationData.to];
        
        if (calculationData.isAC) {
            total += 5000;
        }

        total += 3000; 

        total = total * calculationData.days;

        return total;
    };

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key >= '0' && e.key <= '9') {
                handleNumber(e.key);
            } else if (e.key === '.') {
                handleDecimal();
            } else if (e.key === 'Enter' || e.key === '=') {
                handleEquals();
            } else if (e.key === 'Escape') {
                handleClear();
            } else if (['+', '-', '*', '/'].includes(e.key)) {
                handleOperation(e.key);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [calcDisplay, operation, prevValue]);

    const calculate = useCallback((firstValue, secondValue, operation) => {
        switch (operation) {
            case '+':
                return firstValue + secondValue;
            case '-':
                return firstValue - secondValue;
            case '*':
                return firstValue * secondValue;
            case '/':
                return secondValue !== 0 ? firstValue / secondValue : 0;
            case '=':
                return secondValue;
            default:
                return 0;
        }
    }, []);

    const handleNumber = useCallback((num) => {
        if (waitingForNewValue) {
            setCalcDisplay(String(num));
            setWaitingForNewValue(false);
        } else {
            setCalcDisplay(calcDisplay === '0' ? String(num) : calcDisplay + num);
        }
    }, [calcDisplay, waitingForNewValue]);

    const handleDecimal = useCallback(() => {
        if (waitingForNewValue) {
            setCalcDisplay('0.');
            setWaitingForNewValue(false);
        } else if (calcDisplay.indexOf('.') === -1) {
            setCalcDisplay(calcDisplay + '.');
        }
    }, [calcDisplay, waitingForNewValue]);

    const handleOperation = useCallback((nextOperation) => {
        const inputValue = parseFloat(calcDisplay);

        if (prevValue === null) {
            setPrevValue(inputValue);
        } else if (operation) {
            const currentValue = prevValue || 0;
            const newValue = calculate(currentValue, inputValue, operation);

            setCalcDisplay(String(newValue));
            setPrevValue(newValue);
        }

        setWaitingForNewValue(true);
        setOperation(nextOperation);
    }, [calcDisplay, prevValue, operation, calculate]);

    const handleEquals = useCallback(() => {
        const inputValue = parseFloat(calcDisplay);

        if (prevValue !== null && operation) {
            const newValue = calculate(prevValue, inputValue, operation);
            setCalcDisplay(String(newValue));
            setPrevValue(null);
            setOperation(null);
            setWaitingForNewValue(true);
        }
    }, [calcDisplay, prevValue, operation, calculate]);

    const handleClear = useCallback(() => {
        setCalcDisplay('0');
        setPrevValue(null);
        setOperation(null);
        setWaitingForNewValue(false);
    }, []);

    const handleBackspace = useCallback(() => {
        if (calcDisplay.length > 1) {
            setCalcDisplay(calcDisplay.slice(0, -1));
        } else {
            setCalcDisplay('0');
        }
    }, [calcDisplay]);

    const handleMemoryClear = useCallback(() => setMemory(0), []);
    const handleMemoryRecall = useCallback(() => {
        setCalcDisplay(String(memory));
        setWaitingForNewValue(true);
    }, [memory]);
    const handleMemoryAdd = useCallback(() => {
        setMemory(memory + parseFloat(calcDisplay));
    }, [memory, calcDisplay]);
    const handleMemorySubtract = useCallback(() => {
        setMemory(memory - parseFloat(calcDisplay));
    }, [memory, calcDisplay]);

    const formattedDisplay = useMemo(() => {
        const num = parseFloat(calcDisplay);
        if (!isNaN(num) && calcDisplay.indexOf('.') === -1) {
            return num.toLocaleString('en-IN');
        }
        return calcDisplay;
    }, [calcDisplay]);

    return (
        <div className="calculate-page">
            <div className="calculator-container">
                <div className="expense-calculator">
                    <h2>Tour Expense Calculator</h2>
                    <div className="form-group">
                        <label>From:</label>
                        <select
                            value={calculationData.from}
                            onChange={(e) => setCalculationData({
                                ...calculationData,
                                from: e.target.value
                            })}
                        >
                            <option value="">Select Starting Point</option>
                            {destinations.from.map((city) => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>To:</label>
                        <select
                            value={calculationData.to}
                            onChange={(e) => setCalculationData({
                                ...calculationData,
                                to: e.target.value
                            })}
                        >
                            <option value="">Select Destination</option>
                            {destinations.to.map((city) => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Number of Days:</label>
                        <input
                            type="number"
                            min="1"
                            max="10"
                            value={calculationData.days}
                            onChange={(e) => setCalculationData({
                                ...calculationData,
                                days: parseInt(e.target.value)
                            })}
                        />
                    </div>

                    <div className="form-group checkbox">
                        <label>
                            <input
                                type="checkbox"
                                checked={calculationData.isAC}
                                onChange={(e) => setCalculationData({
                                    ...calculationData,
                                    isAC: e.target.checked
                                })}
                            />
                            AC Bus (Additional ₹5,000)
                        </label>
                    </div>

                    <div className="total-amount">
                        <h3>Total Amount:</h3>
                        <p>₹{calculateTotal().toLocaleString('en-IN')}</p>
                    </div>
                </div>

                <div className="cost-per-head-calculator">
                    <h3>Cost Per Head Calculator</h3>
                    <div className="calculator">
                        <div className="calc-form">
                            <div className="calc-input-group">
                                <label>Total Amount (₹):</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={calculationData.totalAmount || ''}
                                    onChange={(e) => setCalculationData({
                                        ...calculationData,
                                        totalAmount: parseFloat(e.target.value) || 0
                                    })}
                                    placeholder="Enter total amount"
                                />
                            </div>
                            
                            <div className="calc-input-group">
                                <label>Number of Passengers:</label>
                                <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={calculationData.passengers}
                                    onChange={(e) => setCalculationData({
                                        ...calculationData,
                                        passengers: parseInt(e.target.value) || 1
                                    })}
                                />
                            </div>
                            
                            {calculationData.totalAmount > 0 && calculationData.passengers > 0 && (
                                <div className="calc-result">
                                    <h4>The cost per head is: ₹{Math.ceil(calculationData.totalAmount / calculationData.passengers).toLocaleString('en-IN')}</h4>
                                </div>
                            )}
                        </div>
                    </div>

                    {}
                    <div className="basic-calculator">
                        <div className="calculator-header">
                            <h3>✨ Quick Calculator</h3>
                            <div className="memory-indicator">
                                {memory !== 0 && <span className="memory-badge">M: {memory}</span>}
                            </div>
                        </div>
                        <div className="calculator-body">
                            <div className="calculator-display">
                                <div className="display-operation">
                                    {prevValue !== null && `${prevValue} ${operation || ''}`}
                                </div>
                                <div className="display-value">
                                    {formattedDisplay}
                                </div>
                            </div>
                            
                            <div className="calculator-memory-buttons">
                                <button onClick={handleMemoryClear} className="btn-memory" title="Memory Clear">MC</button>
                                <button onClick={handleMemoryRecall} className="btn-memory" title="Memory Recall">MR</button>
                                <button onClick={handleMemoryAdd} className="btn-memory" title="Memory Add">M+</button>
                                <button onClick={handleMemorySubtract} className="btn-memory" title="Memory Subtract">M-</button>
                            </div>
                            
                            <div className="calculator-buttons">
                                <button onClick={handleClear} className="btn-clear">AC</button>
                                <button onClick={handleBackspace} className="btn-function">⌫</button>
                                <button onClick={() => handleOperation('/')} className="btn-operator">÷</button>
                                <button onClick={() => handleOperation('*')} className="btn-operator">×</button>
                                
                                <button onClick={() => handleNumber('7')} className="btn-number">7</button>
                                <button onClick={() => handleNumber('8')} className="btn-number">8</button>
                                <button onClick={() => handleNumber('9')} className="btn-number">9</button>
                                <button onClick={() => handleOperation('-')} className="btn-operator">−</button>
                                
                                <button onClick={() => handleNumber('4')} className="btn-number">4</button>
                                <button onClick={() => handleNumber('5')} className="btn-number">5</button>
                                <button onClick={() => handleNumber('6')} className="btn-number">6</button>
                                <button onClick={() => handleOperation('+')} className="btn-operator">+</button>
                                
                                <button onClick={() => handleNumber('1')} className="btn-number">1</button>
                                <button onClick={() => handleNumber('2')} className="btn-number">2</button>
                                <button onClick={() => handleNumber('3')} className="btn-number">3</button>
                                <button onClick={handleEquals} className="btn-equals" rowSpan="2">=</button>
                                
                                <button onClick={() => handleNumber('0')} className="btn-zero btn-number">0</button>
                                <button onClick={handleDecimal} className="btn-number">.</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Calculate;
