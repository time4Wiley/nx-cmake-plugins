#include "testhello-cpp.h"

TEST(libhello_cpp, test_hello_cpp) {
    EXPECT_EQ(helloCpp(), 0);
}

