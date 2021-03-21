Feature: Stock Alerts

  Scenario Outline: A stock alert is updated in the Database
    Given a <product> source for <source> exists
    When that source is updated
    Then the last_sent date is updated

    Examples:
      | product | source |
      | PS5     | Smyths |
      | PS5     | Amazon |
      | 3080    | Nvidia |

