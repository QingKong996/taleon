const PI_AI_DIST = /node_modules[\\/]@earendil-works[\\/]pi-ai[\\/]dist[\\/]/;

// Metro requires dynamic imports to use statically analyzable specifiers.
module.exports = function piAiDynamicImports({ types: t }) {
  return {
    visitor: {
      CallExpression(path, state) {
        if (
          !PI_AI_DIST.test(state.file.opts.filename ?? '') ||
          path.node.callee.type !== 'Import'
        ) {
          return;
        }

        const [specifier] = path.node.arguments;
        if (!t.isExpression(specifier) || t.isStringLiteral(specifier)) {
          return;
        }

        path.replaceWith(
          t.callExpression(
            t.memberExpression(
              t.callExpression(
                t.memberExpression(
                  t.identifier('Promise'),
                  t.identifier('resolve'),
                ),
                [specifier],
              ),
              t.identifier('then'),
            ),
            [
              t.arrowFunctionExpression(
                [t.identifier('moduleName')],
                t.callExpression(t.identifier('require'), [
                  t.identifier('moduleName'),
                ]),
              ),
            ],
          ),
        );
      },
    },
  };
};
