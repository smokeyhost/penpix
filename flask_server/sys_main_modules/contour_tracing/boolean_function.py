from sympy import symbols, Not, Xor, Or, And, simplify_logic, simplify, false, true
from sympy.logic.boolalg import Nor, Xnor, Nand
import itertools
import re

def convert_to_sympy_expression(expression, num_vars):
    """Convert a boolean expression string to a SymPy expression, accommodating up to num_vars variables."""

    var_symbols = [symbols(f'X{i+1}') for i in range(num_vars)]
    symbols_dict = {f'X{i+1}': var_symbols[i] for i in range(num_vars)}
    
    for var in symbols_dict:
        expression = expression.replace(var, str(symbols_dict[var]))

    sympy_expression = eval(expression, {
        'Xor': Xor,
        'Xnor': Xnor,
        'And': And,
        'Or': Or,
        'Not': Not,
        'Nor': Nor,
        'Nand': Nand,
        **symbols_dict
    })
    
    return sympy_expression

def evaluate_boolean_expression(expr, values):
    """Substitute values into the SymPy expression and evaluate it."""
    symbols_dict = {f'X{i+1}': symbols(f'X{i+1}') for i in range(len(values))}
    substitution = {symbols_dict[key]: values[key] for key in values}
    result = expr.subs(substitution)
    
    return result

def generate_truth_table(expression, input_count):
    """Generate the truth table for a boolean expression."""
    variables = symbols(f'X1:{input_count+1}')
    symbols_dict = {f'X{i+1}': variables[i] for i in range(input_count)}

    table = []
    for values in itertools.product([0, 1], repeat=input_count):
        val_dict = dict(zip(symbols_dict.values(), values))
        result = expression.subs(val_dict)

        if result is true:
            result = 1
        elif result is false:
            result = 0

        table.append((*values, result))

    return table

def string_to_sympy_expression(expression):
    X1, X2, X3, X4, X5, X6, X7, X8 = symbols('X1 X2 X3 X4 X5 X6 X7 X8') 
    eval_expr = eval(expression)
    simplified_expr = simplify_logic(eval_expr)

    return simplified_expr 


def count_inputs(equations: list):
    counts = {}
    max_x = 0

    for equation in equations:
        matches = re.findall(r'X(\d+)', equation)

        if matches:
            for match in matches:
                index = int(match)
                if 1 <= index <= 8:  
                    counts[f'X{index}'] = counts.get(f'X{index}', 0) + 1

            max_x = max(max_x, max(int(match) for match in matches))
    
    return max_x
