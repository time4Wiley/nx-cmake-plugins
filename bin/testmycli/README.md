# testmycli

This C test binary was generated using [nx-cmaker](https://www.npmjs.com/package/nx-cmaker).

## Configuring the test binary using [CMake](https://cmake.org/cmake/help/latest/index.html)

```shell
nx cmake testmycli --output-style=stream
```

## Building the test binary using [Make](https://www.gnu.org/software/make/manual/make.html) and [GCC](https://gcc.gnu.org/onlinedocs/)

```shell
nx build testmycli --output-style=stream
```

## Linting the test binary using [clang-tidy](https://clang.llvm.org/extra/clang-tidy/)

```shell
nx lint testmycli --output-style=stream
```

## Formatting the test binary using [clang-format](https://clang.llvm.org/docs/ClangFormat.html)

```shell
nx fmt testmycli --output-style=stream
```

## Testing the test binary using [ctest](https://cmake.org/cmake/help/latest/manual/ctest.1.html) and [cmocka](https://cmocka.org/)

```shell
nx test testmycli --output-style=stream
```
