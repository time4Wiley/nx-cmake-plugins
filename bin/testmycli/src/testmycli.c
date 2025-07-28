#include "testmycli.h"

static int setup(void **state) {
    (void) state;
    return 0;
}

static int teardown(void **state) {
    (void) state;
    return 0;
}

static void test_mycli(void **state) {
    (void) state;
    mycli();
}

int main(void) {
    const struct CMUnitTest mycli_tests[] = {
        cmocka_unit_test(test_mycli),
    };
    return cmocka_run_group_tests(mycli_tests, setup, teardown);
}

