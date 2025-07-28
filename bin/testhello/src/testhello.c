#include "testhello.h"

static int setup(void **state) {
    (void) state;
    return 0;
}

static int teardown(void **state) {
    (void) state;
    return 0;
}

static void test_hello(void **state) {
    (void) state;
    hello();
}

int main(void) {
    const struct CMUnitTest hello_tests[] = {
        cmocka_unit_test(test_hello),
    };
    return cmocka_run_group_tests(hello_tests, setup, teardown);
}

