const Visitor = require('@swc/core/Visitor').default;

class ExcludeConsole extends Visitor {
  visitExpressionStatement(token) {
    const { expression } = token
    if (expression.type === 'CallExpression' && expression.callee.object.value === 'console' && expression.callee.property.value === 'log') {
      return {
        type: token.type,
        span: token.span,
        expression: {
          type: 'UnaryExpression',
          span: {
            start: expression.span.start,
            end: expression.span.start + 4,
            ctxt: 0
          },
          operator: 'void',
          argument: {
            type: 'NumericLiteral',
            span: {
              start:expression.span.start + 5,
              end: expression.span.start + 6, 
              ctxt: 0
            },
            value: 0
          }
        }
      };
    }
    return token
  }
}

module.exports = ExcludeConsole
