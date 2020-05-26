require 'pg'

class Saved_Data
  def self.get_data
    puts 'connecting'
    connection = PG.connect(dbname: 'thermostat')
    result = connection.exec("SELECT * FROM data;")
    puts 'selecting'
    result.map do |row|
      @temperature = row['temperature']
      @power_saving = row['power_saving']
    end
    [@temperature, @power_saving]
  end

  def self.save_data(temperature, power_saving)
    connection = PG.connect(dbname: 'thermostat')
    connection.exec("TRUNCATE data;")
    connection.exec("INSERT INTO data (temperature, power_saving) VALUES('#{temperature}', '#{power_saving}');")
  end

end
