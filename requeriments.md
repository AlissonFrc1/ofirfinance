Create a function to calculate credit card statement values

Given a credit card list being rendered on screen, we need to add the statement value for each card. This value should be calculated by querying the card_expense table using the following rules:

Database Structure (card_expense table):
- date: purchase date
- cardid: identifies which card the expense belongs to
- value: purchase amount
- fixed: boolean indicating if it's a recurring expense
- recurring: boolean indicating if it's an installment purchase
- installments: number of installments
- duedate: identifies which statement month this expense belongs to
- endrecurrencedate: defines the last statement date for fixed expenses

Calculation Rules:

1. Regular Purchases:
- Single occurrence
- Full value added to the statement month defined in duedate

2. Installment Purchases (recurring = true):
- Value should be divided by the number of installments
- Monthly installments should be added starting from duedate
- Continue for the number of months defined in installments

3. Recurring Expenses (fixed = true):
- Full value should be added monthly starting from duedate
- If endrecurrencedate is set:
  * Continue until reaching endrecurrencedate
- If endrecurrencedate is null:
  * Continue for 12 months from the query date

Return the total statement value for each card, considering all applicable expenses according to these rules.

Expected Input:
- List of card IDs
- Query date (to calculate the 12-month period for recurring expenses)

Expected Output:
- Map/dictionary with card IDs as keys and their respective statement values